const { role, playNext } = require("./musicPlayer");

module.exports = {
  name: "skip",
  description: "skip to next song",
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

    playNext(message.guild.id);
  },
};