import { ICommand } from "wokcommands";
import axios, { AxiosRequestConfig } from "axios";

export default {
	category: "Random",
	description: "Replies with a random joke",

	slash: false,
	testOnly: false,

	callback: async ({ message }) => {
		try {
			const requestConfig: AxiosRequestConfig = {
				headers: {
					Accept: "application/json",
					"User-Agent":
						"My Discord Bot (https://github.com/NabilHadi/RadCat-Bot)",
				},
			};
			const res = await axios.get(
				"https://v2.jokeapi.dev/joke/Misc",
				requestConfig
			);
			if (res.data.type == "twopart") {
				message.reply(`${res.data.setup}\n${res.data.delivery}`);
			} else {
				message.reply(res.data.joke);
			}
		} catch (error) {
			let eMsg;
			if (error instanceof Error) eMsg = error.message;
			else eMsg = String(error);
			await message.reply("❌ Error: " + eMsg);
			return;
		}
	},
} as ICommand;
