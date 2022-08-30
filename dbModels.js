const { Sequelize, DataTypes } = require('sequelize');

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

async function createModels() {
  await guildsDB.sync();
  await configsDB.sync();
  await shortsDB.sync();
  await gifsDB.sync();
  console.log("muladb sync complete.")
}

createModels();