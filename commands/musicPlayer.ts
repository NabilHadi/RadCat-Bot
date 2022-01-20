import { Message, Snowflake, TextChannel, VoiceChannel } from "discord.js";
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
} from "@discordjs/voice";

interface Song {
	title?: string;
	url?: string;
}

interface ServerQueue {
	voiceChannel: VoiceChannel;
	textChannel: TextChannel;
	voiceConnection?: VoiceConnection;
	audioPlayer?: AudioPlayer;
	songs: Song[];
}

export const role = "dj";

// Global queue. Every server will have a key and value pair in this map. { guild.id, queueConstructor{} }
const globalServersQueues = new Map<string, ServerQueue>();

export async function play(
	message: Message,
	args: string[],
	guildId: Snowflake,
	textChannel: TextChannel,
	voiceChannel: VoiceChannel
) {
	if (!message) return;
	let song: Song = {
		title: "",
		url: "",
	};
	// If the first argument is a link. Set the song object to have two keys. Title and URl.
	if (isValidHttpUrl(args[0])) {
		const linkType = ytValidate(args[0]);
		if (linkType === "video") {
			const songInfo = await videoInfo(args[0]);
			song = {
				title: songInfo.video_details.title,
				url: songInfo.video_details.url,
			};
		} else if (linkType === "playlist") {
			const playlist = await playlistInfo(args[0]);
			textChannel.send(`Found a playlist with ${playlist.total_videos}`);
			textChannel.send(
				"The link provided is for a playlist, which is not supported currently!"
			);
			return;
		} else {
			return;
		}
	} else {
		const video = await queryVideo(args.join(" "));
		if (video) {
			song = { title: video.title, url: video.url };
		} else {
			textChannel.send("Error finding video.");
			return;
		}
	}

	if (!song.title || !song.url) {
		console.log(song.title, song.url);
		textChannel.send("Error finding video.");
		return;
	}

	// if a server queue already exists then add song to existing queue
	if (isThereQueue(guildId)) {
		const serverQueue = getServerQueue(guildId)!;
		serverQueue.songs.push(song);
		await textChannel.send(`👍 **${song.title}** added to queue!`);
		return;
	}

	const serverQueue = createServerQueue(guildId, voiceChannel, textChannel);
	serverQueue.songs.push(song);

	// Establish a connection and play the song with the videoPlayer function.
	try {
		const voiceConnection = createVoiceConnection(
			voiceChannel.id,
			voiceChannel.guild.id,
			voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
		);

		serverQueue.voiceConnection = voiceConnection;
		const player = createAudioPlayer();
		serverQueue.audioPlayer = player;
		serverQueue.voiceConnection.subscribe(player);

		player.on("stateChange", (oldState, newState) => {
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
		playSong(guildId, serverQueue.songs[0]);
	} catch (err) {
		globalServersQueues.delete(guildId);
		await message.channel.send("There was an error connecting!");
		throw err;
	}
}

async function playSong(guildId: Snowflake, song: Song | undefined) {
	// If no song is left in the server queue.
	// Leave the voice channel and delete the key and value pair from the global queue.
	if (!song || !song.title || !song.url) {
		stopConnection(guildId);
		return;
	}
	const serverQueue = getServerQueue(guildId);
	const source = await stream(song.url);
	const audioResource = createAudioResource(source.stream, {
		inputType: source.type,
	});

	serverQueue?.audioPlayer?.play(audioResource);
	await serverQueue?.textChannel.send(`🎶 Now playing **${song.title}**`);
}

function playNext(guildId: Snowflake) {
	pausePlayer(guildId);
	const serverQueue = getServerQueue(guildId);
	serverQueue?.songs.shift();
	playSong(guildId, serverQueue?.songs[0]);
}

export function pausePlayer(guildId: Snowflake) {
	getServerQueue(guildId)?.audioPlayer?.pause();
}

export function unpausePlayer(guildId: Snowflake) {
	getServerQueue(guildId)?.audioPlayer?.unpause();
}

export function isPlaying(guildId: Snowflake) {
	if (!isThereQueue(guildId)) return false;
	return (
		getServerQueue(guildId)?.audioPlayer?.state.status ===
		AudioPlayerStatus.Playing
	);
}

export function isThereQueue(guildId: string) {
	return getServerQueue(guildId) !== undefined;
}

function getServerQueue(guildId: string) {
	return globalServersQueues.get(guildId);
}

export function stopConnection(guildId: Snowflake) {
	const serverQueue = getServerQueue(guildId);
	if (!serverQueue) return;
	serverQueue.voiceConnection?.destroy();
	serverQueue.audioPlayer?.stop();
	globalServersQueues.delete(guildId);
	console.log(`voice connection stopped for guild id:${guildId}`);
}

function createServerQueue(
	guildId: string,
	voiceChannel: VoiceChannel,
	textChannel: TextChannel,
	voiceConnection?: VoiceConnection,
	audioPlayer?: AudioPlayer,
	songs: Song[] = []
) {
	const serverQueue: ServerQueue = {
		voiceChannel: voiceChannel,
		textChannel: textChannel,
		voiceConnection: voiceConnection,
		audioPlayer: audioPlayer,
		songs: songs,
	};
	globalServersQueues.set(guildId, serverQueue);
	console.log(`created new Server Queue for guild id: ${guildId}`);
	return serverQueue;
}

function createVoiceConnection(
	voiceChannelId: string,
	guildId: string,
	voiceAdapterCreator: DiscordGatewayAdapterCreator
) {
	return joinVoiceChannel({
		channelId: voiceChannelId,
		guildId: guildId,
		adapterCreator: voiceAdapterCreator,
		selfDeaf: true,
		selfMute: false,
	});
	// return joinVoiceChannel({
	// 	channelId: voiceChannelId,
	// 	guildId: guildId,
	// 	adapterCreator: voiceAdapterCreator,
	// });
}

async function queryVideo(query: string, limit = 1) {
	console.log(`video search query for ${query} with limit: ${limit}`);
	const searchResult = await search(query, { limit: limit });
	if (limit === 1) {
		const infoData = await videoInfo(searchResult[0].url);
		return infoData.video_details;
	} else {
		// TODO
	}
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
