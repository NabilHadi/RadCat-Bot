import { ICommand } from "wokcommands";

export default {
	category: "Testing",
	description: "Replies with pong", // Required for slash commands

	slash: "both", // Create both a slash and legacy command
	testOnly: false, // Only register a slash command for the testing guilds

	callback: () => {
		const reply = "Pong!";
		return reply;
	},
} as ICommand;
