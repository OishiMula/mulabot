require('dotenv').config();

const botToken = process.env.MULA_TOKEN;
const botClientId = process.env.CLIENT_ID;
const blockfrostToken = process.env.BLOCKFROST_TOKEN;
const tenorToken = process.env.TENOR_TOKEN;

module.exports = {
  botToken,
  botClientId,
  blockfrostToken,
  tenorToken,
};
