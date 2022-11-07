import fs from "node:fs";
import path from "node:path";

import {
  Client,
  Collection,
  GatewayIntentBits,
  GuildTextBasedChannel,
  SlashCommandBuilder,
} from "discord.js";
import DisTube, { Queue } from "distube";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const commands = new Collection<
  string,
  { data: SlashCommandBuilder; execute: Function }
>();

const commandsPath = path.join(__dirname, "commands/musicCommands/");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  import(filePath).then((obj) => {
    const command = obj.default;
    if (!command) return;
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  });
}

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

// Create a new DisTube
export const distube = new DisTube(client, {
  searchSongs: 5,
  searchCooldown: 30,
  leaveOnEmpty: true,
  leaveOnFinish: true,
  leaveOnStop: true,
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.guild || !interaction.member) {
    return;
  }

  const command = commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply(
      `No command matching ${interaction.commandName} was found.`
    );
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    if (
      ["clear", "list", "pause", "play", "resume", "skip", "stop"].includes(
        command.data.name
      )
    ) {
      if (!interaction.isChatInputCommand()) return;
      if (!interaction.guild || !interaction.member) {
        return;
      }

      const member = interaction.guild.members.cache.get(
        interaction.member.user.id
      );
      if (!member) return;

      // If member not in a voice channel reply with msg
      if (!member.voice.channel || !member.voice.channelId) {
        await interaction.reply({
          content: "You are not in a voice channel!",
          ephemeral: true,
        });
        return;
      }

      // If bot is in a voice channel and memeber is not in the same channel
      // reply with msg
      if (
        interaction.guild.members.me?.voice.channelId &&
        member.voice.channelId !== interaction.guild.members.me.voice.channelId
      ) {
        await interaction.reply({
          content: "You are not in my voice channel!",
          ephemeral: true,
        });
        return;
      }

      await command.execute(interaction, {
        voiceChannel: member.voice.channel,
        member,
        guild: interaction.guild,
      });
    } else {
      command.execute(interaction, {
        guild: interaction.guild,
      });
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }

  // if (commandName === "ping") {
  //   await interaction.reply("Pong!");
  // } else if (commandName === "server") {
  //   await interaction.reply("Server info.");
  // } else if (commandName === "user") {
  //   await interaction.reply("User info.");
  // } else if (commandName === "queue") {
  //   const queue = distube.getQueue(interaction.guild.id);
  //   if (!queue) {
  //     interaction.reply("Nothing playing right now!");
  //   } else {
  //     interaction.reply(
  //       `Current queue:\n${queue.songs
  //         .map(
  //           (song, id) =>
  //             `**${id ? id : "Playing"}**. ${song.name} - \`${
  //               song.formattedDuration
  //             }\``
  //         )
  //         .slice(0, 10)
  //         .join("\n")}`
  //     );
  //   }
  // } else if (commandName === "filter") {
  //   const subCommand = interaction.options.getSubcommand();
  //   const queue = distube.getQueue(interaction.guild.id);

  //   if (!queue) {
  //     interaction.reply("Nothing playing right now!");
  //     return;
  //   }

  //   if (subCommand === "reset") {
  //     clearFilters(queue);
  //     interaction.reply(getCurrentFiltersMsg(queue));
  //     return;
  //   } else if (subCommand === "current") {
  //     interaction.reply(getCurrentFiltersMsg(queue));
  //     return;
  //   }

  //   const filterName = interaction.options.getString("filter-name");

  //   console.log(filterName);
  //   if (
  //     !filterName ||
  //     ![
  //       "3d",
  //       "nightcore",
  //       "bassboost",
  //       "echo",
  //       "karaoke",
  //       "vaporwave",
  //     ].includes(filterName)
  //   ) {
  //     interaction.reply("Incorrect filter name");
  //     return;
  //   }

  //   if (subCommand === "add") {
  //     addFilter(filterName, queue);
  //   } else if (subCommand === "remove") {
  //     removeFilter(filterName, queue);
  //   }

  //   interaction.reply(getCurrentFiltersMsg(queue));
  // }
});

function addFilter(filterName: string, queue: Queue) {
  if (!queue.filters.has(filterName)) {
    queue.filters.add(filterName);
  }
}

function removeFilter(filterName: string, queue: Queue) {
  if (queue.filters.has(filterName)) {
    queue.filters.remove(filterName);
  }
}

function clearFilters(queue: Queue) {
  if (queue.filters.size > 0) {
    queue.filters.clear();
  }
}

function getCurrentFiltersMsg(queue: Queue): string {
  return `Current queue filter: ${queue.filters.names.join(", ") || "Off"}`;
}

const status = (queue: any) => {
  return `Volume: \`${queue.volume}%\` | Filter: \`${
    queue.filters.names.join(", ") || "Off"
  }\` | Loop: \`${
    queue.repeatMode
      ? queue.repeatMode === 2
        ? "All Queue"
        : "This Song"
      : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
};

// DisTube event listeners, more in the documentation page
distube
  .on("playSong", (queue, song) =>
    queue.textChannel?.send(
      `Playing \`${song.name}\` - \`${
        song.formattedDuration
      }\`\nRequested by: ${song.user}\n${status(queue)}`
    )
  )
  .on("addSong", (queue, song) =>
    queue.textChannel?.send(
      `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    )
  )
  .on("addList", (queue, playlist) =>
    queue.textChannel?.send(
      `Added \`${playlist.name}\` playlist (${
        playlist.songs.length
      } songs) to queue\n${status(queue)}`
    )
  )
  .on("error", (textChannel, e) => {
    console.error(e);
    textChannel?.send(`An error encountered: ${e.message.slice(0, 2000)}`);
  })
  .on("finish", (queue) => queue.textChannel?.send("Finish queue!"))
  .on("disconnect", (queue) => queue.textChannel?.send("Disconnected!"))
  .on("empty", (queue) =>
    queue.textChannel?.send(
      "The voice channel is empty! Leaving the voice channel..."
    )
  )
  // DisTubeOptions.searchSongs > 1
  .on("searchResult", (message, result) => {
    let i = 0;
    message.channel.send(
      `**Choose an option from below**\n${result
        .map((song) => `**${++i}**. ${song.name} - \`\``)
        .join("\n")}\n*Enter anything else or wait 30 seconds to cancel*`
    );
  })
  .on("searchCancel", (message) => message.channel.send("Searching canceled"))
  .on("searchInvalidAnswer", (message) =>
    message.channel.send("Invalid number of result.")
  )
  .on("searchNoResult", (message) => message.channel.send("No result found!"))
  .on("searchDone", () => {});

client.login(process.env.TOKEN);

export default client;
