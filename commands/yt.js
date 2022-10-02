const { SlashCommandBuilder } = require('discord.js');
const { youtube } = require('scrape-youtube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yt')
    .setDescription('Youtube search - find some soul for your laziness')
    .addStringOption((option) => option.setName('search').setDescription('Enter a search term').setRequired(true)),

  async execute(interaction) {
    const searchQ = interaction.options.getString('search').toLowerCase();
    const { videos } = await youtube.search(searchQ);
    await interaction.editReply(videos[0].link);
    return 'Done';
  },
};
