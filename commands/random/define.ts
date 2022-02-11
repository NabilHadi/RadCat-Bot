import { ICommand } from "wokcommands";
import axios, { AxiosRequestConfig } from "axios";
import { MessageEmbed } from "discord.js";
import ApiRequest from "../../utils/apiUtils/apiRequest";

export default {
	category: "Random",
	description: "Searches the urban dictionary for a given term",

	minArgs: 1,
	expectedArgs: "<word or phrase> <Optional: \\number for diffrent definition>",
	slash: false,
	testOnly: false,

	callback: async ({ message, args }) => {
		try {
			let definNumber;
			args = args.filter((arg) => {
				// match for "\(number)"
				if (arg.match(/\\\d/g)) {
					// slice the "\" and subtract 1 cause arrays start at 0
					definNumber = parseInt(arg.slice(1)) - 1;
					return false;
				}
				return true;
			});

			const queryParams = {
				term: args.join(" "),
			};
			const res = await ApiRequest.get(
				"http://api.urbandictionary.com/v0/define",
				{ queryParams }
			);
			const queryResults = res.data.list;

			if (queryResults.length < 1) {
				message.reply(`No Results were found for ${args.join(" ")}`);
				return;
			}

			const definition = queryResults[definNumber || 0];
			const msgEmbd = new MessageEmbed()
				.setTitle(definition.word)
				.setURL(definition.permalink)
				.setDescription(definition.definition)
				.addField("Example", definition.example)
				.setFooter({
					text: "Definition from Urban Dictionary",
					iconURL:
						"https://img.utdstc.com/icon/4af/833/4af833b6befdd4c69d7ebac403bfa087159601c9c129e4686b8b664e49a7f349:200",
				});

			message.reply({ embeds: [msgEmbd] });
		} catch (error) {
			console.error(error);
			let eMsg;
			if (error instanceof Error) eMsg = error.message;
			else eMsg = String(error);
			await message.reply("❌ Error: " + eMsg);
			return;
		}
	},
} as ICommand;
