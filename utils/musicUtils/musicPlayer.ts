import { Player, Queue } from "discord-player";
import {
	GuildMember,
	Message,
	Snowflake,
	TextChannel,
	VoiceChannel,
} from "discord.js";
import client from "../../main";

interface QueueMetadata {
	textChannel: TextChannel;
	voiceChannel: VoiceChannel;
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

const player = new Player(client);
const role = "dj";

player.on("trackStart", (queue, track) => {
	(<QueueMetadata>queue.metadata).textChannel.send(
		`🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`
	);
});

player.on("trackAdd", (queue, track) => {
	(<QueueMetadata>queue.metadata).textChannel.send(
		`🎶 | Track **${track.title}** queued!`
	);
});

player.on("botDisconnect", (queue) => {
	(<QueueMetadata>queue.metadata).textChannel.send(
		"❌ | I was manually disconnected from the voice channel, clearing queue!"
	);
});

player.on("channelEmpty", (queue) => {
	(<QueueMetadata>queue.metadata).textChannel.send(
		"❌ | Nobody is in the voice channel, leaving..."
	);
});

player.on("queueEnd", (queue) => {
	(<QueueMetadata>queue.metadata).textChannel.send("✅ | Queue finished!");
});

player.on("error", (queue, error) => {
	console.log(
		`[${queue.guild.name}] Error emitted from the queue: ${error.message}`
	);
});

player.on("connectionError", (queue, error) => {
	console.log(
		`[${queue.guild.name}] Error emitted from the connection: ${error.message}`
	);
});

async function play(
	message: Message,
	args: string[],
	guildId: Snowflake,
	textChannel: TextChannel,
	voiceChannel: VoiceChannel
) {
	// create or get guild's queue
	const queue = player.createQueue(guildId, {
		metadata: { textChannel, voiceChannel },
		leaveOnEmpty: true,
		leaveOnEmptyCooldown: 500,
		leaveOnEnd: true,
		leaveOnStop: true,
	});

	// connect to voice channel
	try {
		if (!queue.connection) await queue.connect(voiceChannel);
	} catch (error) {
		queue.destroy();
		return await message.reply("Could not join your voice channel!");
	}

	// search for track/playlist
	const query = args.join(" ");
	const searchResult = await player.search(query, {
		requestedBy: message.author,
	});

	// If no playlist found play a track
	if (!searchResult.playlist) {
		const track = searchResult.tracks[0];
		if (!track)
			return await message.reply(`❌ | Track **${query}** not found!`);
		await queue.play(track);
		return;
	}

	// play first track in playlist and add the rest of tracks to the queue
	queue.play(searchResult.playlist.tracks.shift());
	queue.addTracks(searchResult.playlist.tracks);
	await message.reply(
		`👍 | Queuing ${searchResult.playlist.tracks.length} tracks!`
	);
}

function stopPlayer(guildId: Snowflake) {
	player.getQueue(guildId).stop();
}
// returns true if player is paused otherwise returns false
function pausePlayer(guildId: Snowflake) {
	const queue = player.getQueue(guildId);
	if (queue.setPaused(true)) {
		queue.playing = false;
		return true;
	} else {
		return false;
	}
}

// returns true if player is unpaused otherewise returns false
function unpausePlayer(guildId: Snowflake) {
	// If you try to unpause player when it is already unpaused it will stop playing compeletly
	// so I added a check to see if player if paused before trying to unpause
	const queue = player.getQueue(guildId);
	if (queue.playing) {
		// already playing no need to unpause
		return false;
	} else {
		queue.setPaused(false);
		queue.playing = true;
		return true;
	}
}

function skipTrack(guildId: Snowflake) {
	return player.getQueue(guildId).skip();
}

function skipTo(guildId: Snowflake, trackNumber: number) {
	player.getQueue(guildId).skipTo(trackNumber);
}

function clearQueue(guildId: Snowflake) {
	player.getQueue(guildId).clear();
}

function getTracks(guildId: Snowflake) {
	return player.getQueue(guildId).tracks;
}

function getBotVoiceChannel(guildId: Snowflake) {
	const queue = player.getQueue(guildId);
	return queue ? (<QueueMetadata>queue.metadata).voiceChannel : null;
}

// TODO: test this
function isPlaying(guildId: Snowflake) {
	return player.getQueue(guildId).playing || false;
}

function checkMusicPermission(
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

export {
	play,
	stopPlayer,
	pausePlayer,
	unpausePlayer,
	skipTrack,
	skipTo,
	clearQueue,
	getTracks,
	getBotVoiceChannel,
	isPlaying,
	checkMusicPermission,
};
