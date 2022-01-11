const Discord = require("discord.js");
require("dotenv").config();

const generateIamge = require("./generateImage");

const prefix = "rc!";

const fs = require('fs');

const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS"
  ]
});

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  console.log(`Loggen in as ${client.user.tag}`);
});


client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    client.commands.get('ping').execute(message, args);
  } else if (command === "youtube") {
    client.commands.get("youtube").execute(message, args);
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