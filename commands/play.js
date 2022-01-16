const { role, play } = require("./musicPlayer");

module.exports = {
  name: "play",
  description: "play youtube videos",
  async execute(message, args) {
    if (!message.member.roles.cache.some(r => r.name === role)) {
      message.channel.send(`you need to have the ${role} role to use this command`);
      return;
    } else if (!args.length) {
      message.channel.send("You need to send the second argument!");
      return;
    }
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send("You need to be in a voice channel to use this command");

    play(message, args);
  },
};