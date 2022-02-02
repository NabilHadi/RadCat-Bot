import { ICommand } from "wokcommands";
import axios, { AxiosRequestConfig } from "axios";

export default {
	category: "Random",
	description: "Replies with a random dad joke",

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
			const res = await axios.get("https://icanhazdadjoke.com/", requestConfig);
			const joke = res.data.joke;
			message.reply(joke);
		} catch (error) {
			let eMsg;
			if (error instanceof Error) eMsg = error.message;
			else eMsg = String(error);
			await message.reply("❌ Error: " + eMsg);
			return;
		}
	},
} as ICommand;
