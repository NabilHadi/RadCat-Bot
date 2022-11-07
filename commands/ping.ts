import { Interaction } from "discord.js";

import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild || !interaction.member) {
      return;
    }

    await interaction.reply("Pong!");
  },
};
