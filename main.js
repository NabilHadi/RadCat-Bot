const Discord = require("discord.js");
require("dotenv").config();

const generateIamge = require("./generateImage");

const prefix = "rc!";

const fs = require("fs");
const commandDirPath = "./commands/";

const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_VOICE_STATES",
  ],
});


client.commands = new Discord.Collection();

const commandFilesNames = fs.readdirSync(commandDirPath).filter(file => file.endsWith(".js"));
for (const fileName of commandFilesNames) {
  const commandFile = require(`${commandDirPath}${fileName}`);
  client.commands.set(commandFile.name, commandFile);
}

client.on("ready", () => {
  console.log(`Loggen in as ${client.user.tag}`);
});


client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    client.commands.get("ping").execute(message);
  } else if (command === "play") {
    client.commands.get("play").execute(message, args);
  } else if (command === "leave") {
    client.commands.get("leave").execute(message);
  } else if (command === "skip") {
    client.commands.get("skip").execute(message);
  } else if (command === "pause") {
    client.commands.get("pause").execute(message);
  } else if (command === "unpause") {
    client.commands.get("unpause").execute(message);
  }
});

const welcomeChannelId = "531492104309047309";

client.on("guildMemberAdd", async (member) => {
  const img = await generateIamge(member);
  member.guild.channels.cache.get(welcomeChannelId).send({
    content: `<@${member.id}> Welcome to the server!`,
    files: [img],
  });
});


client.login(process.env.TOKEN);