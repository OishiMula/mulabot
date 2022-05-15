/* Mula Bot - Revamped in Node.js!
Created by Oishi Mula, 5/1/2022 */

// Add required libs
require('dotenv').config();
const fs = require('node:fs');
const token = process.env.MULATEST_TOKEN;
//const fetch = require('cross-fetch');
//const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');

// Create Discord client Instance
const { Client, Collection, Intents } = require('discord.js');
const discordIntents = new Intents();
discordIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES)
const client = new Client({ intents: discordIntents });

// To load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Functions
//const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

client.once('ready', async () => {
  console.log("Mula Bot - Upcoming!");
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

/* Commands Missing:
TODO: top10
TODO: top10all
TODO: toke
TODO: shorts
TODO: mmm
TODO: traitfloor
TODO: addproject
TODO: on message content
*/

client.login(token);

