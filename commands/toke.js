const { SlashCommandBuilder } = require('discord.js');
const CoinGecko = require('coingecko-api');
const currency = require('currency.js');
const { download, createMsg } = require('../mula_functions');
const { mulaCACHE } = require('../db');

const exchIcon = 'https://i.postimg.cc/gctt7GW6/minswap.png';
const minswapApi = 'https://api-mainnet-prod.minswap.org/coinmarketcap/v2/pairs';
const CoinGeckoClient = new CoinGecko();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('toke')
    .setDescription('Check your coin value')
    .addStringOption((option) => option.setName('coin').setDescription('Enter a coin').setRequired(true)),

  async execute(interaction) {
    const coinChoice = interaction.options.getString('coin').toLowerCase();
    const ticker = await download(minswapApi, 'data');
    const policyIds = Object.keys(ticker);
    let found = 0;
    for (const p of policyIds) {
      const adaCurrency = (value) => currency(value, { symbol: '₳', precision: 5 });
      // const adaRate = Number((Object.values(ada.data))[0].usd);
      if (ticker[p].base_symbol.toLowerCase() === coinChoice) {
        if (!await mulaCACHE.get('adaRate')) {
          const ada = await CoinGeckoClient.simple.price({ ids: 'cardano', vs_currencies: 'usd' });
          await mulaCACHE.set('adaRate', ada.data.cardano.usd, 3600000);
        }
        const adaRate = await mulaCACHE.get('adaRate');
        const messages = [];
        const msgPayload = {
          title: `${ticker[p].base_name} stats`,
          thumbnail: exchIcon,
          source: 'minswap',
        };
        messages.push({ name: 'Current Price', value: `${adaCurrency(ticker[p].last_price).format()}\n (${currency(ticker[p].last_price * adaRate, { precision: 4 }).format()})`, inline: true });
        messages.push({ name: 'Volume', value: `${adaCurrency(ticker[p].quote_volume).format()}`, inline: true });
        const embed = await createMsg(msgPayload, messages);
        await interaction.editReply({ embeds: [embed] });
        found = 1;
        break;
      }
    }

    if (found === 0) {
      const notFound = ['error', coinChoice];
      return notFound;
    }
    return 'Done';
  },
};
