import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import { REST, SlashCommandBuilder, Routes } from "discord.js";

dotenv.config();

const clientId = "680089364755251275";
const guildId = "935868138820603965";

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Replies with server info!"),
  new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info!"),
  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Display the Current songs queue"),
  new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Add, Remove, or check song filters")
    .addSubcommand((subcommandGroup) => {
      return subcommandGroup
        .setName("add")
        .setDescription("Add song filter")
        .addStringOption((builder) => {
          return builder
            .setName("filter-name")
            .setDescription("Filter name")
            .addChoices(
              {
                name: "3d",
                value: "3d",
              },
              {
                name: "bassboost",
                value: "bassboost",
              },
              {
                name: "echo",
                value: "echo",
              },
              {
                name: "karaoke",
                value: "karaoke",
              },
              {
                name: "nightcore",
                value: "nightcore",
              },
              {
                name: "vaporwave",
                value: "vaporwave",
              }
            );
        });
    })
    .addSubcommand((subcommandGroup) => {
      return subcommandGroup
        .setName("remove")
        .setDescription("Remove song filter")
        .addStringOption((builder) => {
          return builder
            .setName("filter-name")
            .setDescription("Filter name")
            .addChoices(
              {
                name: "3d",
                value: "3d",
              },
              {
                name: "bassboost",
                value: "bassboost",
              },
              {
                name: "echo",
                value: "echo",
              },
              {
                name: "karaoke",
                value: "karaoke",
              },
              {
                name: "nightcore",
                value: "nightcore",
              },
              {
                name: "vaporwave",
                value: "vaporwave",
              }
            );
        });
    })
    .addSubcommand((subcommandGroup) => {
      return subcommandGroup
        .setName("current")
        .setDescription("Get Current applies filters");
    })
    .addSubcommand((subcommandGroup) => {
      return subcommandGroup
        .setName("reset")
        .setDescription("Remove all filters");
    }),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN || "");

(async () => {
  const commandsPath = path.join(__dirname, "commands/musicCommands/");
  // Grab all the command files from the commands directory you created earlier
  const commandFiles = fs
    .readdirSync("./commands/musicCommands")
    .filter((file) => file.endsWith(".ts"));

  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    await import(filePath).then((obj) => {
      if (!obj.default) return;
      commands.push(obj.default.data.toJSON());
    });
  }

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    await rest.put(
      Routes.applicationGuildCommands(clientId, "954622183219548180"),
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
