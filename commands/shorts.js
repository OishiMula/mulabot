const { SlashCommandBuilder } = require('discord.js');
const { createMsg } = require('../mula_functions');
const { botIcon } = require('../config/config');
const { SQL } = require('../db');

function shortsMsg(shortcuts) {
  let msg = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const short of Object.keys(shortcuts)) msg += `**${shortcuts[short].short}** :: ${shortcuts[short].full}\n`;
  return msg;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shorts')
    .setDescription('See shortcuts available.'),

  async execute(interaction) {
    const shortcutsAvailable = await SQL('shorts').select('short', 'full');
    shortsMsg(shortcutsAvailable);

    const msgPayload = {
      title: 'Shortcuts Available',
      source: 'Mula Bot',
      header: 'Format: Short name :: Long name ',
      content: shortsMsg(shortcutsAvailable),
      thumbnail: botIcon,
    };

    const embed = await createMsg(msgPayload);
    await interaction.editReply({ embeds: [embed] });
    return 'Done';
  },
};
