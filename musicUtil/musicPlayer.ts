import {
	GuildMember,
	Message,
	Snowflake,
	TextChannel,
	VoiceChannel,
} from "discord.js";
import {
	yt_validate as ytValidate,
	video_info as videoInfo,
	search,
	stream,
	playlist_info as playlistInfo,
} from "play-dl";
import {
	DiscordGatewayAdapterCreator,
	joinVoiceChannel,
	VoiceConnection,
	createAudioResource,
	createAudioPlayer,
	AudioPlayerStatus,
	AudioPlayer,
	getVoiceConnection,
} from "@discordjs/voice";

interface Song {
	title: string;
	url: string;
	length: string;
}

interface ServerQueue {
	voiceChannel: VoiceChannel;
	textChannel: TextChannel;
	voiceConnection: VoiceConnection;
	audioPlayer: AudioPlayer;
	songs: Song[];
}

interface MusicPermission {
	hasPermission: boolean;
	denyReason: {
		flag: MusicPermissionDenyReason;
		description: string;
	};
}

export enum MusicPermissionDenyReason {
	NO_ROLE = "no role",
	NOT_IN_VOICE_CHANNEL = "not in a voice channel",
	NOT_IN_SAME_VOICE_CHANNEL = "not in the same voice channel",
	NONE = "none",
}

enum ArgumentTypes {
	VIDEO = "video",
	PLAYLIST = "playlist",
	SEARCH = "search",
	ELSE = "else",
}

enum SuccessText {
	NOW_PLAYING,
	QUEUED_SONG,
	QUEUED_PLAYLIST,
}

export const role = "dj";

// Global queue. Every server will have a key and value pair in this map. { guild.id, serverQueue{} }
const globalServersQueues = new Map<Snowflake, ServerQueue>();

export async function play(
	message: Message,
	args: string[],
	guildId: Snowflake,
	textChannel: TextChannel,
	voiceChannel: VoiceChannel
) {
	try {
		const argumentType = getArgumentType(args);
		if (argumentType === ArgumentTypes.ELSE) {
			throw new Error("Provided link/query is not supported");
		}

		let serverQueue = getServerQueue(guildId);
		if (!serverQueue) {
			serverQueue = await initSongPlayer(guildId, voiceChannel, textChannel);
			if (argumentType === ArgumentTypes.PLAYLIST) {
				await handlePlaylistPlaying(args, guildId, serverQueue, false);
				return;
			}
			const song = await fetchSong(args, argumentType);
			addSongToQueue(song, serverQueue);
			playSong(guildId, song);
			return;
		}

		if (argumentType === ArgumentTypes.PLAYLIST) {
			await handlePlaylistPlaying(args, guildId, serverQueue, true);
			return;
		}

		const song = await fetchSong(args, argumentType);
		addSongToQueue(song, serverQueue);
		sendSuccessMessage(
			textChannel,
			SuccessText.QUEUED_SONG,
			song.title,
			song.length
		);
	} catch (error) {
		if (!isPlaying(guildId)) {
			stopConnection(guildId);
		}
		console.error(error);
		let eMsg;
		if (error instanceof Error) eMsg = error.message;
		else eMsg = String(error);
		await message.reply("❌ Error: " + eMsg);
		return;
	}
}

function addSongToQueue(song: Song, serverQueue: ServerQueue) {
	serverQueue.songs.push(song);
	return true;
}

function addSongsToQueue(songs: Song[], serverQueue: ServerQueue) {
	serverQueue.songs.push(...songs);
	return true;
}

async function initSongPlayer(
	guildId: Snowflake,
	voiceChannel: VoiceChannel,
	textChannel: TextChannel
) {
	const serverQueue = createServerQueue(guildId, voiceChannel, textChannel);

	serverQueue.voiceConnection.subscribe(serverQueue.audioPlayer);
	serverQueue.audioPlayer.on("stateChange", (oldState, newState) => {
		console.log(
			`Audio player transitioned from ${oldState.status} to ${newState.status}`
		);
		if (
			oldState.status === AudioPlayerStatus.Playing &&
			newState.status === AudioPlayerStatus.Idle
		) {
			playNext(guildId);
		}
	});

	return serverQueue;
}

async function fetchSong(
	args: string[],
	argumentType: ArgumentTypes.SEARCH | ArgumentTypes.VIDEO
): Promise<Song> {
	if (argumentType === ArgumentTypes.SEARCH) {
		const queryString = args.join(" ");
		const video = await queryYTVideo(queryString);

		if (!video.title || !video.url) {
			console.log(video);
			throw new Error("Song has no title or has no url");
		}

		return {
			title: video.title,
			url: video.url,
			length: video.durationRaw,
		};
	} else if (argumentType === ArgumentTypes.VIDEO) {
		const video = (await videoInfo(args[0])).video_details;

		if (!video.title || !video.url) {
			console.log(video);
			throw new Error("Song has no title or has no url");
		}

		return {
			title: video.title,
			url: video.url,
			length: video.durationRaw,
		};
	} else throw new Error("Invalid argument type in fetchSong");
}

async function fetchPlaylistSongs(args: string[]) {
	const playlist = await playlistInfo(args[0], { incomplete: true });
	const videos = await playlist.all_videos();
	const songs: Song[] = [];
	for (let video of videos) {
		if (!video.title) continue;
		const song: Song = {
			title: video.title,
			url: video.url,
			length: video.durationRaw,
		};
		songs.push(song);
	}
	return songs;
}

async function handlePlaylistPlaying(
	args: string[],
	guildId: Snowflake,
	serverQueue: ServerQueue,
	queue: boolean
) {
	const songs = await fetchPlaylistSongs(args);
	const firstSong = songs[0];
	if (!firstSong) throw new Error("Empty playlist");
	addSongsToQueue(songs, serverQueue);
	sendSuccessMessage(
		serverQueue.textChannel,
		SuccessText.QUEUED_PLAYLIST,
		songs.length.toString()
	);
	if (queue) return;

	playSong(guildId, firstSong);
}

async function sendSuccessMessage(
	textChannel: TextChannel,
	messageType: SuccessText,
	...args: string[]
) {
	switch (messageType) {
		case SuccessText.NOW_PLAYING:
			await textChannel.send(
				`🎶 Now playing **${args[0]}** for **(${args[1]})**`
			);
			break;
		case SuccessText.QUEUED_SONG:
			await textChannel.send(`👍 **${args[0]}** (${args[1]}) added to queue!`);
			break;
		case SuccessText.QUEUED_PLAYLIST:
			await textChannel.send(`👍 Added ${args[0]} songs to the Queue!`);
	}
}

function getArgumentType(args: string[]): ArgumentTypes {
	if (!isValidHttpUrl(args[0])) return ArgumentTypes.SEARCH;
	const linkType = ytValidate(args[0]);
	if (linkType === "video") return ArgumentTypes.VIDEO;
	else if (linkType === "playlist") return ArgumentTypes.PLAYLIST;
	else return ArgumentTypes.ELSE;
}

async function playSong(guildId: Snowflake, song: Song | undefined) {
	const serverQueue = getServerQueue(guildId);
	if (!song || !serverQueue) {
		stopConnection(guildId);
		return;
	}

	const source = await stream(song.url);
	const audioResource = createAudioResource(source.stream, {
		inputType: source.type,
	});

	serverQueue.audioPlayer.play(audioResource);
	sendSuccessMessage(
		serverQueue.textChannel,
		SuccessText.NOW_PLAYING,
		song.title,
		song.length.toString()
	);
}

export function playNext(guildId: Snowflake) {
	pausePlayer(guildId);
	const serverQueue = getServerQueue(guildId);
	serverQueue?.songs.shift();
	playSong(guildId, serverQueue?.songs[0]);
}

export function pausePlayer(guildId: Snowflake) {
	const serverQueue = getServerQueue(guildId);
	if (!serverQueue) return;
	serverQueue.audioPlayer.pause();
}

export function unpausePlayer(guildId: Snowflake) {
	const serverQueue = getServerQueue(guildId);
	if (!serverQueue) return;
	serverQueue.audioPlayer.unpause();
}

export function getBotVoiceChannel(guildId: Snowflake) {
	return getServerQueue(guildId)?.voiceChannel || null;
}

export function isPlaying(guildId: Snowflake) {
	if (!getServerQueue(guildId)) return false;
	return getAudioPlayerStatus(guildId) === AudioPlayerStatus.Playing;
}

function getServerQueue(guildId: string) {
	return globalServersQueues.get(guildId) || null;
}

export function stopConnection(guildId: Snowflake) {
	const serverQueue = getServerQueue(guildId);
	if (!serverQueue) {
		getVoiceConnection(guildId)?.destroy();
		return;
	}
	serverQueue.audioPlayer.stop();
	serverQueue.voiceConnection.destroy();
	serverQueue.songs.length = 0;
	globalServersQueues.delete(guildId);
	console.log(`voice connection stopped for guild id:${guildId}`);
}

function createServerQueue(
	guildId: string,
	voiceChannel: VoiceChannel,
	textChannel: TextChannel,
	songs: Song[] = []
) {
	const serverQueue: ServerQueue = {
		voiceChannel: voiceChannel,
		textChannel: textChannel,
		voiceConnection: createVoiceConnection(
			voiceChannel.id,
			voiceChannel.guild.id,
			voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
		),
		audioPlayer: createAudioPlayer(),
		songs: songs,
	};

	globalServersQueues.set(guildId, serverQueue);
	console.log(`created new Server Queue for guild id: ${guildId}`);
	return serverQueue;
}

function createVoiceConnection(
	voiceChannelId: Snowflake,
	guildId: Snowflake,
	voiceAdapterCreator: DiscordGatewayAdapterCreator
) {
	return joinVoiceChannel({
		channelId: voiceChannelId,
		guildId: guildId,
		adapterCreator: voiceAdapterCreator,
		selfDeaf: true,
		selfMute: false,
	});
}

// TODO: handle query for more than one video
async function queryYTVideo(query: string) {
	console.log(`Youtube video search query for (${query})`);
	const searchResult = await search(query, {
		limit: 1,
		source: { youtube: "video" },
	});
	return searchResult[0];
}

function isValidHttpUrl(string: string) {
	let url;

	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}

export function checkMusicPermission(
	member: GuildMember,
	shouldBeInSameVoiceChannel: boolean
): MusicPermission {
	if (!member.roles.cache.some((r) => r.name === role)) {
		return {
			hasPermission: false,
			denyReason: {
				flag: MusicPermissionDenyReason.NO_ROLE,
				description: `you need to have the ${role} role to use this command`,
			},
		};
	} else if (!member.voice.channel) {
		return {
			hasPermission: false,
			denyReason: {
				flag: MusicPermissionDenyReason.NOT_IN_VOICE_CHANNEL,
				description: "You need to be in a voice channel to use this command",
			},
		};
	} else if (shouldBeInSameVoiceChannel) {
		const guildId = member.guild.id;
		const botVoiceChannel = getBotVoiceChannel(guildId);

		if (!botVoiceChannel) {
			return {
				hasPermission: true,
				denyReason: {
					flag: MusicPermissionDenyReason.NONE,
					description: "",
				},
			};
		} else {
			if (botVoiceChannel.id === member.voice.channel.id) {
				return {
					hasPermission: true,
					denyReason: {
						flag: MusicPermissionDenyReason.NONE,
						description: "",
					},
				};
			} else {
				return {
					hasPermission: false,
					denyReason: {
						flag: MusicPermissionDenyReason.NOT_IN_SAME_VOICE_CHANNEL,
						description:
							"You have to be in the same voice channel as the bot to use this command",
					},
				};
			}
		}
	} else {
		return {
			hasPermission: true,
			denyReason: {
				flag: MusicPermissionDenyReason.NONE,
				description: "",
			},
		};
	}
}

export function getAudioPlayerStatus(guildId: Snowflake) {
	return getServerQueue(guildId)?.audioPlayer?.state.status || null;
}

export function getSongsArray(guildId: Snowflake) {
	return getServerQueue(guildId)?.songs;
}
