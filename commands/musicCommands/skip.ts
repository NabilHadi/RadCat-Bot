import { ICommand } from "wokcommands";
import {
  checkMusicPermission,
  skipTrack,
} from "../../utils/musicUtils/musicPlayer";
export default {
  category: "Music",
  description: "skip currently playing song", // Required for slash commands

  guildOnly: true,
  slash: false, // Create both a slash and legacy command
  testOnly: false, // Only register a slash command for the testing guilds

  callback: ({ message, guild, member }) => {
    if (guild === null) return;

    const permission = checkMusicPermission(member, true);
    if (permission.hasPermission === false) {
      message.reply(permission.denyReason.description);
      return;
    }

    skipTrack(guild.id);
    // TODO: handle slash command interaction
  },
} as ICommand;
