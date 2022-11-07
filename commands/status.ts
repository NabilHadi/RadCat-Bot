// import { ActivityType, Client, PresenceStatusData } from "discord.js";
// import commandUtils from "../utils/commandUtils";

// const getActivtyType = (text: String) => {
//   switch (text) {
//     case "listening":
//       return ActivityType.Listening;
//     case "watching":
//       return ActivityType.Watching;
//     case "streaming":
//       return ActivityType.Streaming;
//     case "competing":
//       return ActivityType.Competing;
//     default:
//       return ActivityType.Playing;
//   }
// };

// const getStatusType = (text: String) => {
//   switch (text) {
//     case "idle":
//       return "idle";
//     case "dnd":
//       return "dnd";
//     case "invisible":
//       return "invisible";
//     default:
//       return "online";
//   }
// };

// type StatusOptions = {
//   type?: Exclude<ActivityType, ActivityType.Custom>;
//   name?: string;
//   status?: PresenceStatusData;
//   url?: string;
// };

// const setStatus = (client: Client, options: StatusOptions) => {
//   client.user?.setPresence({
//     status: options.status,
//     afk: true,
//     activities: [
//       {
//         name: options.name,
//         type: options.type,
//         url: options.url,
//       },
//     ],
//   });
// };

// import {
//   ChatInputCommandInteraction,
//   Guild,
//   SlashCommandBuilder,
// } from "discord.js";
// import { distube } from "../main";

// export default {
//   data: new SlashCommandBuilder()
//   .setName("resume")
//   .setDescription("Updates the status for the bot").setDefaultMemberPermissions(),
// async execute(
//   interaction: ChatInputCommandInteraction,
//   { guild }: { guild: Guild }
// ) {
//   distube.resume(guild);
//   await interaction.reply({
//     content: "Resumed the music!",
//     ephemeral: true,
//   });
// },
//   description: "Updates the status for the bot",

//   minArgs: 2,
//   expectedArgs: "<activity?> <name?> <url?>",

//   ownerOnly: true,
//   hidden: true,

//   init: (client: Client) => {
//     setStatus(client, {
//       status: "online",
//       type: ActivityType.Watching,
//       name: "TV",
//     });
//   },

//   callback: ({ client, text, message }) => {
//     const options = commandUtils.getArgs(text);
//     setStatus(client, {
//       type: getActivtyType(options.activity),
//       name: options.name,
//       status: getStatusType(options.status),
//       url: options.url,
//     });

//     message.react("✅");
//   },
// } as ICommand;
