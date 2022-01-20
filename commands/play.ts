import { VoiceChannel } from "discord.js";
import { ICommand } from "wokcommands";
import { role, play } from "../musicUtil/musicPlayer";
export default {
	category: "Music",
	description: "play youtube videos", // Required for slash commands

	slash: false, // Create both a slash and legacy command
	testOnly: true, // Only register a slash command for the testing guilds

	callback: ({ message, interaction, args, channel, guild }) => {
		if (message != null && message.member != null && guild != null) {
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

			// TODO: check whither the voice channel the member is in, matches
			// the voice channel the bot is in.

			play(message, args, guild.id, channel, voiceChannel);
		}

		// TODO: handle slash command interaction
	},
} as ICommand;
