import { VoiceChannel } from "discord.js";
import { ICommand } from "wokcommands";
import {
	play,
	checkMusicPermission,
	getBotVoiceChannel,
} from "../../musicUtil/musicPlayer";
export default {
	category: "Music",
	description: "play youtube videos", // Required for slash commands

	guildOnly: true,
	minArgs: 1,
	expectedArgs: "<song name or youtube link> ",
	slash: false, // Create both a slash and legacy command
	testOnly: false, // Only register a slash command for the testing guilds

	callback: ({ message, args, channel, guild, member }) => {
		if (guild === null) return;

		const voiceChannel = member.voice.channel as VoiceChannel;
		const botVoiceChannel = getBotVoiceChannel(guild.id);
		let permission;
		if (!botVoiceChannel) {
			permission = checkMusicPermission(member, false);
		} else {
			permission = checkMusicPermission(member, true);
		}

		if (permission.hasPermission === false) {
			message.reply(permission.denyReason.description);
			return;
		}

		play(message, args, guild.id, channel, voiceChannel);
		// TODO: handle slash command interaction
	},
} as ICommand;
