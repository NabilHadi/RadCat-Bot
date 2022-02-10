import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import {
	checkMusicPermission,
	getSongsArray,
	playNext,
} from "../../utils/musicUtil/musicPlayer";
export default {
	category: "Music",
	description: "removes songs in queue", // Required for slash commands

	guildOnly: true,
	minArgs: 1,
	expectedArgs: '<A Number or "all">',
	slash: false, // Create both a slash and legacy command
	testOnly: false, // Only register a slash command for the testing guilds

	callback: ({ message, guild, member, args }) => {
		if (guild === null) return;

		const permission = checkMusicPermission(member, true);
		if (permission.hasPermission === false) {
			message.reply(permission.denyReason.description);
			return;
		}

		const songs = getSongsArray(guild.id);
		if (!songs) {
			message.reply("No songs were found");
			return;
		}

		let option: string | number = args[0];
		console.log(option, typeof option);

		if (isNaN(Number(option))) {
			if (option != "all") {
				message.reply(
					'You must provide song number to remove, or "all" to remove all songs in queue'
				);
				return;
			}

			if (songs.length === 1) {
				message.reply(
					"There is only one song in queue.\n" +
						"To stop playing and/or leave the channel," +
						" use skip or leave commands"
				);
				return;
			}
			songs.length = 1;
			message.reply("Removed all songs");
		} else {
			option = Number(option) - 1;
			if (option === 0) {
				message.reply("Removed currently playing song");
				playNext(guild.id);
				return;
			}

			if (option >= songs.length || option < 1) {
				message.reply("No song at this place in queue");
				return;
			}

			const removedSong = songs.splice(option, 1);
			message.reply(`Removed ${removedSong[0].title} from queue`);
		}

		// TODO: handle slash command interaction
	},
} as ICommand;
