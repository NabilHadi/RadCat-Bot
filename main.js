"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importStar(require("discord.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const prefix = "rc!";
const commandDirPath = "./commands/";
const client = new discord_js_1.default.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});
const commands = new discord_js_1.default.Collection();
const commandFilesNames = fs_1.default
    .readdirSync(commandDirPath)
    .filter((file) => file.endsWith(".js"));
for (const fileName of commandFilesNames) {
    const commandFile = require(`${commandDirPath}${fileName}`);
    commands.set(commandFile.name, commandFile);
}
client.on("ready", () => {
    var _a;
    console.log("Bot is ready!");
    const guildId = "531492104309047307";
    const guild = client.guilds.cache.get(guildId);
    let commands;
    if (guild) {
        commands = guild.commands;
    }
    else {
        commands = (_a = client.application) === null || _a === void 0 ? void 0 : _a.commands;
    }
    commands === null || commands === void 0 ? void 0 : commands.create({
        name: "ping",
        description: "Replies with pong",
    });
});
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    const { commandName, options } = interaction;
    if (commandName === "ping") {
        interaction.reply({
            content: "Pong",
            ephemeral: true,
        });
    }
}));
client.on("messageCreate", (message) => {
    var _a;
    if (!message.content.startsWith(prefix) || message.author.bot)
        return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = (_a = args === null || args === void 0 ? void 0 : args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (command === "ping") {
        commands.get("ping").execute(message);
    }
    else if (command === "play") {
        commands.get("play").execute(message, args);
    }
    else if (command === "leave") {
        commands.get("leave").execute(message);
    }
    else if (command === "skip") {
        commands.get("skip").execute(message);
    }
    else if (command === "pause") {
        commands.get("pause").execute(message);
    }
    else if (command === "unpause") {
        commands.get("unpause").execute(message);
    }
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
