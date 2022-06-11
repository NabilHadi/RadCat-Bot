import { Client, ExcludeEnum, PresenceStatusData } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { ICommand } from "wokcommands";
import commandUtils from "../../utils/commandUtils";

const getActivtyType = (text: String) => {
  switch (text) {
    case "listening":
      return ActivityTypes.LISTENING;
    case "watching":
      return ActivityTypes.WATCHING;
    case "streaming":
      return ActivityTypes.STREAMING;
    case "competing":
      return ActivityTypes.COMPETING;
    default:
      return ActivityTypes.PLAYING;
  }
};

const getStatusType = (text: String) => {
  switch (text) {
    case "idle":
      return "idle";
    case "dnd":
      return "dnd";
    case "invisible":
      return "invisible";
    default:
      return "online";
  }
};

type StatusOptions = {
  type?: ExcludeEnum<typeof ActivityTypes, "CUSTOM">;
  name?: string;
  status?: PresenceStatusData;
  url?: string;
};

const setStatus = (client: Client, options: StatusOptions) => {
  client.user?.setPresence({
    status: options.status,
    afk: true,
    activities: [
      {
        name: options.name,
        type: options.type,
        url: options.url,
      },
    ],
  });
};

export default {
  category: "Configuration",
  description: "Updates the status for the bot",

  minArgs: 2,
  expectedArgs: "<activity?> <name?> <url?>",

  ownerOnly: true,
  hidden: true,

  init: (client: Client) => {
    setStatus(client, {
      status: "online",
      type: ActivityTypes.WATCHING,
      name: "TV",
    });
  },

  callback: ({ client, text, message }) => {
    const options = commandUtils.getArgs(text);
    setStatus(client, {
      type: getActivtyType(options.activity),
      name: options.name,
      status: getStatusType(options.status),
      url: options.url,
    });

    message.react("✅");
  },
} as ICommand;
