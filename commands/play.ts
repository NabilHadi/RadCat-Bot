import {
  ChatInputCommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  SlashCommandBuilder,
  VoiceBasedChannel,
} from "discord.js";
import { distube } from "../main";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play song")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The song you want to play")
        .setRequired(true)
    ),
  async execute(
    interaction: ChatInputCommandInteraction,
    {
      voiceChannel,
      member,
    }: { voiceChannel: VoiceBasedChannel; member: GuildMember }
  ) {
    const query = interaction.options.getString("query");
    if (!query) {
      await interaction.reply({
        content: "No query text provided",
        ephemeral: true,
      });
      return;
    }

    distube.play(voiceChannel, query, {
      textChannel: interaction.channel as GuildTextBasedChannel,
      member: member,
    });
    await interaction.reply({
      content: "Searching ...",
      ephemeral: true,
    });
  },
};
