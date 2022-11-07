import {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandBuilder,
} from "discord.js";
import { Queue } from "distube";
import { distube } from "../main";

export default {
  data: new SlashCommandBuilder()
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
  async execute(
    interaction: ChatInputCommandInteraction,
    { guild }: { guild: Guild }
  ) {
    const subCommand = interaction.options.getSubcommand();
    const queue = distube.getQueue(guild);

    if (!queue) {
      interaction.reply("Nothing playing right now!");
      return;
    }

    if (subCommand === "reset") {
      clearFilters(queue);
      interaction.reply(getCurrentFiltersMsg(queue));
      return;
    } else if (subCommand === "current") {
      interaction.reply(getCurrentFiltersMsg(queue));
      return;
    }

    const filterName = interaction.options.getString("filter-name");

    console.log(filterName);
    if (
      !filterName ||
      ![
        "3d",
        "nightcore",
        "bassboost",
        "echo",
        "karaoke",
        "vaporwave",
      ].includes(filterName)
    ) {
      interaction.reply("Incorrect filter name");
      return;
    }

    if (subCommand === "add") {
      addFilter(filterName, queue);
    } else if (subCommand === "remove") {
      removeFilter(filterName, queue);
    }

    interaction.reply(getCurrentFiltersMsg(queue));
  },
};

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
