import { AudioPlayerStatus } from "@discordjs/voice";
import { ICommand } from "wokcommands";
import { checkMusicPermission } from "../../utils/musicUtils/musicPlayer";
import { unpausePlayer } from "../../utils/musicUtils/musicPlayer";

export default {
	category: "Music",
	description: "unpause music player", // Required for slash commands

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

		// if (isPlaying(guild.id) === true) {
		// 	message.reply("Music is already playing!");
		// 	return;
		// }

		// if (getAudioPlayerStatus(guild.id) !== AudioPlayerStatus.Paused) {
		// 	message.reply("Nothing there to unpause!");
		// 	return;
		// }

		if (unpausePlayer(guild.id)) {
			message.reply("Unpausing...");
		} else {
			message.reply("Did not unpause");
		}

		// TODO: handle slash command interaction
	},
} as ICommand;
