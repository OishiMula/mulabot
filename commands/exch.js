/* eslint-disable prefer-destructuring */
const { SlashCommandBuilder } = require('discord.js');
const CoinGecko = require('coingecko-api');
const chalk = require('chalk');
const { formatCurrency } = require('@coingecko/cryptoformat');
const { mulaCACHE } = require('../db');
const { createMsg } = require('../mula_functions');

const exchIcon = 'https://i.postimg.cc/tRmScp4C/moeny.png';
const CoinGeckoClient = new CoinGecko();

async function createErr(coin, vsCoin = 'usd') {
  const coinProper = coin.toUpperCase();
  const vsCoinProper = vsCoin.toUpperCase();
  const errorCoin = vsCoin === 'usd' ? coinProper : vsCoinProper;
  console.error(chalk.red(`error: ${coin} coin was entered.`));
  const msgPayload = {
    title: 'Coin not found!',
    thumbnail: exchIcon,
    header: `${coinProper} vs ${vsCoinProper}`,
    content: `**${errorCoin}** does not seem to be valid.`,
    source: 'coingecko',
  };
  if (coin === 'invalid') {
    msgPayload.header = 'Not a Number!';
    msgPayload.content = 'You didn\'t enter a number.';
    return createMsg(msgPayload);
  }
  return createMsg(msgPayload);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exch')
    .setDescription('Convert Crypto to Crypto/Fiat')
    .addStringOption((amount) => amount.setName('amount').setDescription('How much?').setRequired(true))
    .addStringOption((coin) => coin.setName('coin').setDescription('What coin? [Default: Cardano]'))
    .addStringOption((vs) => vs.setName('vs').setDescription('Against what coin? [Default: USD]')),
  async execute(interaction) {
    let amount, coinData, coinVsUsd, vsCoinData, vsCoinVsUsd, msgPayload, embed;

    try {
      amount = parseFloat(interaction.options.getString('amount'));
      // eslint-disable-next-line no-throw-literal
      if (amount.isNaN) throw 'Not a Number';
    } catch (error) {
      embed = await createErr('invalid'); await interaction.editReply({ embeds: [embed] }); return 'error';
    }
    const coin = (interaction.options.getString('coin') ?? 'ada').toLowerCase();
    const vsCoin = (interaction.options.getString('vs') ?? '').toLowerCase();

    const coinProper = coin.toUpperCase();
    let vsCoinProper;
    if (vsCoin) vsCoinProper = vsCoin.toUpperCase();

    let cgData = await mulaCACHE.get('cgscoins');
    if (!cgData) {
      cgData = (await CoinGeckoClient.coins.list()).data;
      await mulaCACHE.set('cgscoins', cgData, 604800000);
    }

    let coinMatch = cgData.filter((coins) => coins.symbol === coin && (coins.name.split(' ').length) < 2);
    coinMatch = coinMatch[0];

    try {
      coinData = await CoinGeckoClient.simple.price({ ids: coinMatch.id, vs_currencies: 'usd' });
      coinVsUsd = Number((Object.values(coinData.data))[0].usd);
    } catch (error) {
      embed = await createErr(coin); await interaction.editReply({ embeds: [embed] }); return 'error';
    }

    if (vsCoin === '') {
      msgPayload = {
        title: 'Crypto Convert',
        thumbnail: exchIcon,
        header: `${coinProper} vs USD`,
        content: `**${amount} ${coinProper}** to USD is : **${formatCurrency(amount * coinVsUsd, 'USD', 'en')}**`,
        source: 'coingecko',
      };
      embed = await createMsg(msgPayload);
      await interaction.editReply({ embeds: [embed] });
    } else {
      const coinToUsd = amount * coinVsUsd;
      let vsCoinMatch = await cgData.filter((coins) => coins.symbol === vsCoin && (coins.name.split(' ').length) < 2);
      vsCoinMatch = vsCoinMatch[0];

      try {
        vsCoinData = await CoinGeckoClient.simple.price({ ids: vsCoinMatch.id, vs_currencies: 'usd' });
        vsCoinVsUsd = Number((Object.values(vsCoinData.data))[0].usd);
      } catch (error) {
        embed = await createErr(coin, vsCoin); await interaction.editReply({ embeds: [embed] }); return 'error';
      }

      const coinVsCoin = coinToUsd / vsCoinVsUsd;
      msgPayload = {
        title: 'Crypto Convert',
        thumbnail: exchIcon,
        header: `${coinProper} vs ${vsCoinProper}`,
        content: `**${amount} ${coinProper}** to ${vsCoinProper} is : **${coinVsCoin.toFixed(5)} ${vsCoinProper}**`,
        source: 'coingecko',
      };
      embed = await createMsg(msgPayload);
      await interaction.editReply({ embeds: [embed] });
    }

    return `${coin} vs ${(vsCoin === '') ? 'usd' : `${vsCoin}`}`;
  },
};
