module.exports = {
  name: 'youtube',
  description: "send rick roll video",
  execute(message, args) {
    message.channel.send("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }
}