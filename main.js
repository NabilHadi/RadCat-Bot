const Discord = require("discord.js");
require("dotenv").config();


const generateIamge = require("./generateImage");

const prefix = "rc!";

const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS"
  ]
});


client.on("ready", () => {
  console.log(`Loggen in as ${client.user.tag}`);
});


client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    message.channel.send("pong");
  } else if (command === "youtube") {
    message.channel.send("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }
});

const welcomeChannelId = "531492104309047309";

client.on("guildMemberAdd", async (member) => {
  const img = await generateIamge(member);
  member.guild.channels.cache.get(welcomeChannelId).send({
    content: `<@${member.id}> Welcome to the server!`,
    files: [img]
  });
});




client.login(process.env.TOKEN);