import { Interaction, SlashCommandBuilder } from "discord.js";
import { distube } from "../main";

// export default {
// 	data: new SlashCommandBuilder().setName("clear")
// 	.setDescription("Clear songs in queue"),
// 	async execute(interaction: Interaction) {
// 		if (!interaction.isChatInputCommand()) return;
//     if (!interaction.guild || !interaction.member) {
//       return;
//     }

// 		const member = interaction.guild.members.cache.get(
//       interaction.member.user.id
//     );
//     if (!member) return;

// 		// If member not in a voice channel reply with msg
//     if (!member.voice.channel || !member.voice.channelId) {
//       await interaction.reply({
//         content: "You are not in a voice channel!",
//         ephemeral: true,
//       });
//       return;
//     }

// 		// If bot is in a voice channel and memeber is not in the same channel
//     // reply with msg
//     if (
//       interaction.guild.members.me?.voice.channelId &&
//       member.voice.channelId !== interaction.guild.members.me.voice.channelId
//     ) {
//       await interaction.reply({
//         content: "You are not in my voice channel!",
//         ephemeral: true,
//       });
//       return;
//     }

// 		const queue = distube.getQueue(interaction.guild);
// 		if (!queue) {
// 			await interaction.reply({
// 				content: "Nothing is playing right now!",
// 				ephemeral: true
// 			})
// 		}

// 	}
// };
