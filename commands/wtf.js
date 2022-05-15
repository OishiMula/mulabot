const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { execute } = require('./floor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twtf')
    .setDescription('See commands available. Also, only you can see this. Won\'t spam chat. PROMISE.'),

async execute(interaction) {
  const msgPayload = {
    title : 'Floor',
    mp : 'jpg',
    projectName : project.properName,
    content : `Floor price: **₳${floorPrice}**
    [jpg.store link](${mulaFN.jpgStoreLink}${project.name})`,
    thumbnail : `${mulaFN.ipfsBase}${imgURL}`
  }

  const embed = await mulaFN.createMsg(msgPayload);
  await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}