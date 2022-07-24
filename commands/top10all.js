const { SlashCommandBuilder } = require('@discordjs/builders');
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');
const ordinal = require('ordinal');
const { millify } = require("millify");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top10all')
    .setDescription('Retrieve the Top 10 projects today on OpenCNFT'),
  async execute(interaction) {
    const opencnftData = await mulaFN.download('https://api.opencnft.io/1/rank?window=24h', 'data');
    const top10Today = await opencnftData['ranking'].slice(0,10);

    function saleMsg(sale) {
      let msg = ''
      for (let i = 0; i < sale.length; i += 1) {
        msg += `**${ordinal(i + 1)}** ${sale[i].name} **||** ₳${millify(sale[i].volume)} **||** ₳${sale[i].floor_price} \n`
      }
      return msg;
    }

    const msgPayload = {
      title : 'Top 10 All',
      source : 'opencnft',
      header : "Project Name - 24Hr Volume - Floor Price",
      content : saleMsg(top10Today),
      thumbnail : `${mulaFN.MULA_BOT_IMG}`
    }

    const embed = await mulaFN.createMsg(msgPayload);

    await interaction.reply({ embeds: [ embed ] });
    return 'Done';
  }
}