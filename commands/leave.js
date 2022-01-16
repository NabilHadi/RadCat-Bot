const { role, stopConnection } = require("./musicPlayer");

module.exports = {
  name: "leave",
  description: "stop the bot from playing music and leave the channel",
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

    stopConnection(message.guild.id);
  },
};