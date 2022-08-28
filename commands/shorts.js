const { SlashCommandBuilder } = require('discord.js');
const { createMsg } = require('../mula_functions');
const { botIcon } = require('../config/config');
const { shortsDB } = require('../db');

function shortsMsg(shortcuts) {
  let msg = '';
  for (let short in shortcuts) msg += `**${shortcuts[short].short}** :: ${shortcuts[short].full}\n`;
  return msg;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shorts')
    .setDescription('See shortcuts available.'),

  async execute(interaction) {
    const shortcutsAvailable = await shortsDB.findAll({ attributes: ['short', 'full'], raw: true });
    shortsMsg(shortcutsAvailable);

    const msgPayload = {
      title: 'Shortcuts Available',
      source: "Mula Bot",
      header: "Format: Short name :: Long name ",
      content: shortsMsg(shortcutsAvailable),
      thumbnail: botIcon
    }

    const embed = await createMsg(msgPayload);
    await interaction.editReply({ embeds: [embed] });
    return 'Done';
  }
}