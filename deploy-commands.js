const secrets = require('./config/secrets');
const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = secrets.botToken;
const guildIds = Object.values(secrets.discordGuildIds);
const clientId = process.env.CLIENT_ID;

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({
	version: '9'
}).setToken(token);

for(let guild in guildIds) {
	rest.put(Routes.applicationGuildCommands(clientId, guildIds[guild]), {
		body: commands
	})
	.then(() => console.log(`${Object.keys(secrets.discordGuildIds)[guild]} - Successfully registered application commands.`))
	.catch(console.error);
}