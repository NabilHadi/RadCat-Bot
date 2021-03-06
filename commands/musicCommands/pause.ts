import { ICommand } from "wokcommands";
import {
	pausePlayer,
	checkMusicPermission,
	isPlaying,
} from "../../utils/musicUtils/musicPlayer";

export default {
	category: "Music",
	description: "pause currently playing song", // Required for slash commands

	guildOnly: true,
	slash: false, // Create both a slash and legacy command
	testOnly: false, // Only register a slash command for the testing guilds

	callback: async ({ message, guild, member }) => {
		if (guild === null) return;

		const permission = checkMusicPermission(member, true);
		if (permission.hasPermission === false) {
			message.reply(permission.denyReason.description);
			return;
		}

		if (!isPlaying(guild.id)) {
			message.reply("Nothing is playing right now!");
			return;
		}

		if (pausePlayer(guild.id)) {
			message.reply("Song has been paused");
		} else {
			message.reply("Did not pause");
		}

		// TODO: handle slash command interaction
	},
} as ICommand;
