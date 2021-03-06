import { ICommand } from "wokcommands";
import {
	checkMusicPermission,
	stopPlayer,
} from "../../utils/musicUtils/musicPlayer";

export default {
	category: "Music",
	description: "stop playing music and leave voice channel", // Required for slash commands

	guildOnly: true,
	slash: false, // Create both a slash and legacy command
	testOnly: false, // Only register a slash command for the testing guilds

	callback: ({ message, guild, member }) => {
		if (guild === null) return;

		const permission = checkMusicPermission(member, true);
		if (permission.hasPermission === false) {
			message.reply(permission.denyReason.description);
			return;
		}

		stopPlayer(guild.id);

		// TODO: handle slash command interaction
	},
} as ICommand;
