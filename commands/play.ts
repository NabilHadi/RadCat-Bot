import { VoiceChannel } from "discord.js";
import { ICommand } from "wokcommands";
import { role, play } from "./musicPlayer";
export default {
	category: "Music",
	description: "play youtube videos", // Required for slash commands

	slash: "both", // Create both a slash and legacy command
	testOnly: true, // Only register a slash command for the testing guilds

	callback: ({ message, interaction, args, channel }) => {
		if (message != null && message.member != null && message.guildId != null) {
			if (!message.member.roles.cache.some((r) => r.name === role)) {
				message.reply(`you need to have the ${role} role to use this command`);
				return;
			} else if (!args.length) {
				message.reply("You need to send the second argument!");
				return;
			}
			const voiceChannel = message.member.voice.channel as VoiceChannel;
			if (!voiceChannel) {
				message.reply("You need to be in a voice channel to use this command");
				return;
			}
			play(message, args, message.guildId, channel, voiceChannel);
		}
	},
} as ICommand;
