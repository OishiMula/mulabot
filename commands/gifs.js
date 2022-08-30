const { SlashCommandBuilder } = require('discord.js');
const { createMsg } = require('../mula_functions');
const { botIcon } = require('../config/config');
const { configsDB } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gifs')
    .setDescription('Toggle gifs on/off'),

  async execute(interaction) {
    const gifToggle = await configsDB.findOne({ attributes: ['gifs'], where: { guildid: interaction.guildId }, raw: true });
    const { gifs } = gifToggle;
    let gifStatus;

    switch (gifs) {
      case 0:
        await configsDB.update({ gifs: 1 }, { where: { guildid: interaction.guildId } });
        gifStatus = 'on';
        break;
        
      default:
        await configsDB.update({ gifs: 0 }, { where: { guildid: interaction.guildId }});
        gifStatus = 'off'
        break;
    }

    let msgPayload = {
      title: `Hello ${interaction.user.username}`,
      source: 'me',
      header: 'Gif Mode',
      content: `Gifs are now currently: **${gifStatus}**`,
      thumbnail: `${botIcon}`
    }; 

    const embed = await createMsg(msgPayload);
    await interaction.editReply({ embeds: [embed] });
    return 'Done';
  }
}