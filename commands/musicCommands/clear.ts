import { ICommand } from "wokcommands";
import {
	checkMusicPermission,
	getTracks,
	clearQueue,
} from "../../utils/musicUtils/musicPlayer";

export default {
	category: "Music",
	description: "clear songs in queue", // Required for slash commands

	guildOnly: true,
	slash: false, // Create both a slash and legacy command
	testOnly: false, // Only register a slash command for the testing guilds

	callback: ({ message, guild, member, args }) => {
		if (guild === null) return;

		const permission = checkMusicPermission(member, true);
		if (permission.hasPermission === false) {
			message.reply(permission.denyReason.description);
			return;
		}

		const tracks = getTracks(guild.id);
		if (!tracks) {
			message.reply("No songs were found");
			return;
		}

		clearQueue(guild.id);
		message.reply("Cleared all tracks");

		// TODO: handle slash command interaction
	},
} as ICommand;
