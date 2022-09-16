/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* Mula Bot - Revamped in Node.js!
Created by Oishi Mula, 5/1/2022
*/

// Add required libs
const fs = require('node:fs');
const path = require('path');
const {
  Client, Collection, Partials, GatewayIntentBits,
} = require('discord.js');
const secrets = require('./config/secrets');

// Create Discord client Instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction],
});

// To load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// To load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));

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
