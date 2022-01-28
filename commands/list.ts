import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { checkMusicPermission, getSongsArray } from "../musicUtil/musicPlayer";
export default {
	category: "Music",
	description: "list songs in queue", // Required for slash commands

	slash: false, // Create both a slash and legacy command
	testOnly: false, // Only register a slash command for the testing guilds

	callback: ({ message, interaction, guild, member }) => {
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

		// discord message formating
		let songNames = "";
		for (let i = 0; i < songs.length; i++) {
			songNames += `${i + 1} - [**${songs[i].title}**](${
				songs[i].url
			}) of length (${songs[i].length})\n`;
		}

		const listEmbed = new MessageEmbed()
			.setTitle("List of songs")
			.setDescription(songNames);

		message.reply({ embeds: [listEmbed] });

		// TODO: handle slash command interaction
	},
} as ICommand;
