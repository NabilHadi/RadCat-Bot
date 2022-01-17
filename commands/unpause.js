const { role, unpausePlayer, isPlaying, isThereQueue } = require("./musicPlayer");

module.exports = {
  name: "unpause",
  description: "unpause song",
  execute(message) {
    if (!message.member.roles.cache.some(r => r.name === role)) {
      message.channel.send(`you need to have the ${role} role to use this command`);
      return;
    }

    const voice_channel = message.member.voice.channel;
    if (!voice_channel) {
      message.channel.send("You need to be in a voice channel to use this command");
      return;
    }

    if (isPlaying(message.guild.id)) {
      message.channel.send("Song is already playing");
      return;
    } else {
      if (!isThereQueue(message.guild.id)) {
        message.channel.send("There are no songs available ");
        return;
      }
      unpausePlayer(message.guild.id);
      message.channel.send("Unpausing...");
    }
  },
};