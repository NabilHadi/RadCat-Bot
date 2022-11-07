import {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandBuilder,
} from "discord.js";
import { distube } from "../main";

export default {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("list songs queue"),
  async execute(
    interaction: ChatInputCommandInteraction,
    { guild }: { guild: Guild }
  ) {
    const queue = distube.getQueue(guild);
    if (!queue) {
      await interaction.reply("Nothing playing right now!");
    } else {
      await interaction.reply(
        `Current queue:\n${queue.songs
          .map(
            (song, id) =>
              `**${id ? id : "Playing"}**. ${song.name} - \`${
                song.formattedDuration
              }\``
          )
          .slice(0, 10)
          .join("\n")}`
      );
    }
  },
};
