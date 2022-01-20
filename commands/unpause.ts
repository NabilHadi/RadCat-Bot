import { VoiceChannel } from "discord.js";
import { ICommand } from "wokcommands";
import { role, play, isPlaying, pausePlayer } from "./musicPlayer";
export default {
	category: "Music",
	description: "unpause currently audioplayer", // Required for slash commands

	slash: false, // Create both a slash and legacy command
	testOnly: true, // Only register a slash command for the testing guilds

	callback: ({ message, interaction, guild }) => {
		if (message != null && message.member != null && guild != null) {
			if (!message.member.roles.cache.some((r) => r.name === role)) {
				message.reply(`you need to have the ${role} role to use this command`);
				return;
			}

			const voice_channel = message.member.voice.channel;
			if (!voice_channel) {
				message.reply("You need to be in a voice channel to use this command");
				return;
			}

			// TODO: check whither the voice channel the member is in, matches
			// the voice channel the bot is in.

			if (isPlaying(guild.id)) {
				pausePlayer(guild.id);
				message.reply("Song has been paused");
			} else {
				message.reply("Nothing is playing right now!");
				return;
			}
		}
	},
} as ICommand;
