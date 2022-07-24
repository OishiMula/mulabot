const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vibe')
    .setDescription('Just vibe'),

  async execute(interaction) {
    await interaction.editReply('Just be polite and life\'s good.');
    return 'Done';
  }
}