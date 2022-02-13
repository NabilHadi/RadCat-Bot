import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import {
	getTracks,
	checkMusicPermission,
} from "../../utils/musicUtils/musicPlayer";

export default {
	category: "Music",
	description: "list songs in queue", // Required for slash commands

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

		const tracks = getTracks(guild.id);
		if (!tracks) {
			message.reply("No songs were found");
			return;
		}
		// discord message formating
		let tracksEmbdList = "";
		for (let i = 0; i < tracks.length; i++) {
			if (tracksEmbdList.length > 3000) break;
			tracksEmbdList += `${i + 1} - [**${tracks[i].title}**](${
				tracks[i].url
			}) (${tracks[i].duration})\n`;
		}

		const listEmbed = new MessageEmbed()
			.setTitle("List of songs")
			.setDescription(tracksEmbdList);

		message.reply({ embeds: [listEmbed] });

		// TODO: handle slash command interaction
	},
} as ICommand;
