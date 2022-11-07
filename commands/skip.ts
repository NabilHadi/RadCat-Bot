import {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandBuilder,
} from "discord.js";
import { distube } from "../main";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip current song"),
  async execute(
    interaction: ChatInputCommandInteraction,
    { guild }: { guild: Guild }
  ) {
    distube.skip(guild);
    await interaction.reply({
      content: "Skipped the Song!",
      ephemeral: true,
    });
  },
};
