import DiscordJS, { Intents } from "discord.js";
import WOKCommands from "wokcommands";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const prefix = "?";

const client = new DiscordJS.Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
});

client.on("ready", () => {
	const guildId = "531492104309047307";
	new WOKCommands(client, {
		commandsDir: path.join(__dirname, "commands"),
		typeScript: true,
		ignoreBots: true,
		botOwners: process.env.BOT_OWNER,
		testServers: [`${guildId}`, "590228866606563333"],
		mongoUri: process.env.MONGO_URI,
	})
		.setDefaultPrefix(prefix)
		.setCategorySettings([
			{
				name: "Random",
				emoji: "🎮",
			},
			{
				name: "Music",
				emoji: "🎵",
			},
			{
				name: "Configuration",
				emoji: "🚧",
				hidden: true,
			},
			{
				name: "Testing",
				emoji: "🧪",
				hidden: true,
			},
		]);
});

client.login(process.env.TOKEN);
