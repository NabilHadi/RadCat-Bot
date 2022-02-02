import { ICommand } from "wokcommands";
import axios, { AxiosRequestConfig } from "axios";
import { MessageEmbed } from "discord.js";
import { Parser } from "htmlparser2";

export default {
	category: "Random",
	description: "Replies with a random Pun",

	slash: false,
	testOnly: false,

	callback: async ({ message, args }) => {
		try {
			const requestConfig: AxiosRequestConfig = {
				headers: {
					Accept: "application/json",
					"User-Agent":
						"My Discord Bot (https://github.com/NabilHadi/RadCat-Bot)",
				},
			};
			const queryParams = {
				action: "query",
				list: "search",
				srsearch: args.join(" "),
				utf8: "",
				format: "json",
			};
			const queryString = new URLSearchParams(queryParams).toString();
			const res = await axios.get(
				`https://en.wikipedia.org/w/api.php?${queryString}`,
				requestConfig
			);
			const queryResults = res.data.query.search;
			if (queryResults.length < 1) {
				message.reply(
					`No Results were found for ${args.join(" ")}, Suggestion: ${
						res.data.query.searchinfo.suggestion || "none :("
					}`
				);
			} else {
				let summary: string[] = [];
				const parser = new Parser(
					{
						ontext: (text) => {
							summary.push(text);
						},
					},
					{ decodeEntities: true }
				);
				let resultList = "";
				for (let i = 0; i < queryResults.length; i++) {
					if (resultList.length > 3000) break;
					parser.write(queryResults[i].snippet);
					resultList += `${i + 1} - [${
						queryResults[i].title
					}](https://en.wikipedia.org/wiki/${encodeURIComponent(
						queryResults[i].title
					)})\n${summary.join("")}...\n`;
					summary.length = 0;
				}
				parser.end();

				const listEmbed = new MessageEmbed()
					.setTitle("Results")
					.setDescription(resultList);

				message.reply({ embeds: [listEmbed] });
			}
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
