const { role, pausePlayer, isPlaying } = require("./musicPlayer");

module.exports = {
  name: "pause",
  description: "pause song",
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
      pausePlayer(message.guild.id);
      message.channel.send("Song has been paused");
    } else {
      message.channel.send("Nothing is playing right now!");
      return;
    }
  },
};