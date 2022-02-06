import { Client } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { ICommand } from "wokcommands";

const setStatus = (client: Client, status: string) => {
	client.user?.setPresence({
		status: "online",

		activities: [
			{
				name: status,
				type: ActivityTypes.WATCHING,
			},
		],
	});
};

export default {
	category: "Configuration",
	description: "Updates the status for the bot",

	minArgs: 1,
	expectedArgs: "<status>",

	ownerOnly: true,
	hidden: true,

	// This method is invoked only once whenever the command is registered
	init: (client: Client) => {
		const status = "Youtube";
		setStatus(client, status);
	},

	callback: ({ client, text, message }) => {
		setStatus(client, text);

		message.reply({
			content: "Status set!",
		});
	},
} as ICommand;
