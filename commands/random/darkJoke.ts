import { ICommand } from "wokcommands";
import ApiRequest from "../../utils/apiUtils/apiRequest";

export default {
	category: "Random",
	description: "Replies with a random dark joke",

	slash: false,
	testOnly: false,

	callback: async ({ message }) => {
		try {
			const res = await ApiRequest.get("https://v2.jokeapi.dev/joke/Dark");

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
