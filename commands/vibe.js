const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vibe')
    .setDescription('Just vibe'),

async execute(interaction) {
    await interaction.reply('Just be polite and life\'s good.');
  }
}