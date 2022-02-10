import { ICommand } from "wokcommands";
import ApiRequest from "../../utils/apiUtils/apiRequest";

export default {
	category: "Random",
	description: "Replies with a random dad joke",

	slash: false,
	testOnly: false,

	callback: async ({ message }) => {
		try {
			const res = await ApiRequest.get("https://icanhazdadjoke.com/");

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
