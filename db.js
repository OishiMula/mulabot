const { Sequelize, DataTypes } = require('sequelize');
const Keyv = require('keyv');

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'mula.db'
});

const guildsDB = sequelize.define('guilds', {
  guildid: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: DataTypes.STRING,
  ownerid: DataTypes.STRING,
  interactions: DataTypes.INTEGER
});

const configsDB = sequelize.define('configs', {
  guildid: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  guildname: DataTypes.STRING,
  gifs: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  announcementchannel: DataTypes.STRING,
  twitterchannel: DataTypes.STRING,
  setup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const shortsDB = sequelize.define('shorts', {
  short: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  full: DataTypes.STRING,
});

const gifsDB = sequelize.define('gifs', {
  giftrigger: DataTypes.STRING,
  gifsearch: DataTypes.STRING,
  gid: DataTypes.STRING
});

const mulaRDB = new Keyv('redis://localhost:6379/0');

module.exports = {
  sequelize,
  guildsDB,
  configsDB,
  shortsDB,
  gifsDB,
  mulaRDB
}