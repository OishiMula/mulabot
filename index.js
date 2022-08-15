"use strict";
/* Mula Bot - Revamped in Node.js!
Created by Oishi Mula, 5/1/2022 
pm2 Timestamp / add entry:
pm2 start index.js --name mulabot --log-date-format "MM/DD hh:mm:ssa"
*/

// Add required libs
const fs = require('node:fs');
const path = require('path');
const secrets = require('./config/secrets')

// Create Discord client Instance
const { Client, Collection, Partials, GatewayIntentBits } = require('discord.js');
const client = new Client({
	intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
	],
	partials: [Partials.Message, Partials.Reaction]
});
module.exports = client;

// To load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// To load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(secrets.botToken);