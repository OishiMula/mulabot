/* Mula Bot - Revamped in Node.js!
Created by Oishi Mula, 5/1/2022 
pm2 Timestamp / add entry:
pm2 start index.js --name mulabot --log-date-format "MM-DD | hh:mm:ss a"
*/

// Add required libs
const fs = require('node:fs');
const path = require('path');
const mulaFN = require('./mula_functions');
const config = require('./config/config')
const secrets = require('./config/secrets')

// Create Discord client Instance
const {Client,Collection,Intents} = require('discord.js');
const discordIntents = new Intents();
discordIntents.add(Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGES)
const client = new Client({
	intents: discordIntents
});

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

// Check command and start process
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	// Start a timer to see how long the command takes
	const t0 = performance.now();

	// If it's a command that needs to be sent quietly, else do a regular command
	if (config.ephemeralCommands.includes(interaction.commandName)) {
		await interaction.deferReply({
			interaction,
			ephemeral: true
		});
	} else await interaction.deferReply();

	// Start the command, userInput is the end result for the try block - either pass or fail
	let userInput = await command.execute(interaction);

	try {
		if (userInput[0] === undefined) userInput = 'n/a';
		if (userInput[0] === 'error') throw 'error'
		const t1 = performance.now();
		console.log(`Command: ${interaction.commandName} - ${userInput} -- ${interaction.user.tag} | Time: ${(t1 - t0).toFixed(5)}ms`)
	} catch (error) {
		const t1 = performance.now();
		await interaction.editReply(`I couldn't find ${userInput[1]} -- ${mulaFN.choose(mulaFN.ERROR_SAYINGS)}`);
		console.error(`ERROR: Command: ${interaction.commandName} - ${userInput[1]} -- ${interaction.user.tag} | Time: ${(t1 - t0).toFixed(5)}ms`);
	}
});

client.login(secrets.botToken);

/* Personal Todo list:
TODO: mmm mode / party mode
TODO: toke
TODO: 0verdrips connect to jpg store
TODO: button for hype
*/