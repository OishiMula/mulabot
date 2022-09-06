const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vibe')
    .setDescription('Just vibe'),

  async execute(interaction) {
    await interaction.editReply('Just be polite and life\'s good.');
    return 'Done';
  },
};
