import DiscordJS, { Intents } from "discord.js";
import WOKCommands from "wokcommands";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const prefix = "rc?";
const commandDirPath = "./commands/";

const client = new DiscordJS.Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
});

const commands = new DiscordJS.Collection<string, any>();

const commandFilesNames = fs
	.readdirSync(commandDirPath)
	.filter((file) => file.endsWith(".js"));
for (const fileName of commandFilesNames) {
	const commandFile = require(`${commandDirPath}${fileName}`);
	commands.set(commandFile.name, commandFile);
}

client.on("ready", () => {
	const guildId = "531492104309047307";
	new WOKCommands(client, {
		commandsDir: path.join(__dirname, "commands"),
		typeScript: true,

		testServers: [`${guildId}`, "590228866606563333"],
	}).setDefaultPrefix(prefix);
});

// const generateIamge = require("./generateImage");

// const welcomeChannelId = "531492104309047309";

// client.on("guildMemberAdd", async (member) => {
// 	const img = await generateIamge(member);
// 	member?.guild?.channels?.cache?.get(welcomeChannelId)?.send({
// 		content: `<@${member.id}> Welcome to the server!`,
// 		files: [img],
// 	});
// });

client.login(process.env.TOKEN);
