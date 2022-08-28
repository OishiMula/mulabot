const Sequelize = require('sequelize');
const Keyv = require('keyv');

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'muladb.sqlite'
});

const guildsDB = sequelize.define('guilds', {
  guildid: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: Sequelize.STRING,
  ownerid: Sequelize.STRING
});

const configsDB = sequelize.define('configs', {
  guildid: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  gifsenabled: Sequelize.INTEGER,
  epochchannel: Sequelize.STRING,
  twitterchannel: Sequelize.STRING
});

const shortsDB = sequelize.define('shorts', {
  short: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  full: Sequelize.STRING
});

const mulaRDB = new Keyv('redis://localhost:6379/0');

module.exports = {
  sequelize,
  guildsDB,
  configsDB,
  shortsDB,
  mulaRDB
}