import {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandBuilder,
} from "discord.js";
import { distube } from "../main";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("stop the music"),
  async execute(
    interaction: ChatInputCommandInteraction,
    { guild }: { guild: Guild }
  ) {
    distube.stop(guild);
    await interaction.reply({
      content: "Stopped the music!",
      ephemeral: true,
    });
  },
};
