require('dotenv').config();
// Bot Token
const botToken = process.env.MULA_TOKEN;

// Bot ClientID
const botClientId = process.env.CLIENT_ID;

// Discord GuildIDs for Server to add Slash commands
const discordGuildIds = {
  DegensDen: process.env.DD_GID_TOKEN,
  UsagisDen: process.env.USAGI_GID_TOKEN,
};

// Blockfrost Token
const blockfrostToken = process.env.BLOCKFROST_TOKEN;

// Tenor Token
const tenorToken = process.env.TENOR_TOKEN;

module.exports = {
  botToken,
  botClientId,
  discordGuildIds,
  blockfrostToken,
  tenorToken
}