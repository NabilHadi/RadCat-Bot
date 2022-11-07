import {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandBuilder,
} from "discord.js";
import { distube } from "../main";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("pause current song"),
  async execute(
    interaction: ChatInputCommandInteraction,
    { guild }: { guild: Guild }
  ) {
    distube.pause(guild);
    await interaction.reply({
      content: "Paused the music!",
      ephemeral: true,
    });
  },
};
