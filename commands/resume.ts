import {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandBuilder,
} from "discord.js";
import { distube } from "../main";

export default {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("resume playing current song"),
  async execute(
    interaction: ChatInputCommandInteraction,
    { guild }: { guild: Guild }
  ) {
    distube.resume(guild);
    await interaction.reply({
      content: "Resumed the music!",
      ephemeral: true,
    });
  },
};
