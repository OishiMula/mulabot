const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'muladb.sqlite'
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
  gifsenabled: DataTypes.INTEGER,
  epochchannel: DataTypes.STRING,
  twitterchannel: DataTypes.STRING,
});

const shortsDB = sequelize.define('shorts', {
  short: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  full: DataTypes.STRING,
});

async function createModels() {
  await guildsDB.sync();
  await configsDB.sync();
  await shortsDB.sync();
  console.log("muladb sync complete.")
}

createModels();