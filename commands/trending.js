const { SlashCommandBuilder } = require('discord.js');
const ordinal = require('ordinal');
const { millify } = require('millify');
const mulaFN = require('../mula_functions');
const api = require('../config/api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trending')
    .setDescription('Retrieve the Top 10 projects today on OpenCNFT'),
  async execute(interaction) {
    const opencnftData = await mulaFN.download(api.opencnftTopDaily, 'data');
    const top10Today = await opencnftData.ranking.slice(0, 10);

    const msgPayload = {
      title: 'Top 10 on the CNFT Markets Today!',
      source: 'opencnft',
    };

    const messages = [];
    for (const num of Object.keys(top10Today)) {
      const { name, volume, floor_price } = top10Today[num];
      messages.push({
        name: `${ordinal(Number(num) + 1)} : ${name}`,
        value: `vol :: **₳${millify(volume)}**\nfp : **₳${floor_price}**`,
        inline: true,
      });
    }

    const embed = await mulaFN.createMsg(msgPayload, messages);
    await interaction.editReply({ embeds: [embed] });
    return 'Done';
  },
};
