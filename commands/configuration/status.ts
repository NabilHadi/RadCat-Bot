import { Client, ExcludeEnum } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { ICommand } from "wokcommands";

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

const setStatus = (
  client: Client,
  activityType: ExcludeEnum<typeof ActivityTypes, "CUSTOM">,
  status: string
) => {
  client.user?.setPresence({
    status: "online",
    afk: true,

    activities: [
      {
        name: status,
        type: activityType,
      },
    ],
  });
};

export default {
  category: "Configuration",
  description: "Updates the status for the bot",

  minArgs: 2,
  expectedArgs: "<activity Type> <status>",

  ownerOnly: true,
  hidden: true,

  // This method is invoked only once whenever the command is registered
  init: (client: Client) => {
    const status = "Youtube";
    setStatus(client, "WATCHING", status);
  },

  callback: ({ client, args, message }) => {
    setStatus(client, getActivtyType(args[0]), args[1]);

    message.reply({
      content: "Status set!",
    });
  },
} as ICommand;
