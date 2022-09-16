require('dotenv').config();
const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const SQL = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './mula.db',
  },
  useNullAsDefault: true,
});
const { botToken } = require('./config/secrets');

async function retrieveGuilds() {
  const guilds = await SQL.select('guildid', 'name').from('guilds');
  return guilds;
}

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}
const rest = new REST({ version: '10' }).setToken(botToken);

async function registerCommands() {
  const guilds = await retrieveGuilds();
  for (const guild of guilds) {
    const { guildid, name } = guild;
    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildid), {
      body: commands,
    })
      .then(() => console.log(`${name} - Successfully registered application commands.`))
      .catch(console.error);
  }
}

registerCommands();
