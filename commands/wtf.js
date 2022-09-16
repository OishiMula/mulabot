const { SlashCommandBuilder } = require('discord.js');
const { createMsg } = require('../mula_functions');
const { botIcon } = require('../config/config');
const { SQL } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wtf')
    .setDescription('See commands available. Also, only you can see this. Won\'t spam chat. PROMISE.'),

  async execute(interaction) {
    const allGifs = await SQL('gifs').select('giftrigger')
      .where({ gid: interaction.guildId });
    const gifList = allGifs.map((g) => g.giftrigger);
    const msgPayload = {
      title: 'You need some help!',
      source: 'Mula Bot',
      header: 'Commands available',
      content: `**/floor *<projectname>*** --> Retrieve floor
      **/last *<name> <1-20>*** --> Retrieve last <1-20> of transactions
      **/top *<name>*** --> Retrieve top ten sales of project
      **/trending** --> Retrieve top ten projects today
      **/hypefloor** --> When you need a pick me up
      **/shorts** --> Shows your shortcuts available for projects / tokens
      **/vibe** --> When you just need to vibe a bit
      **/wtf** --> This command
      **Gif Trigger Words:**
      ${gifList}`,
      thumbnail: `${botIcon}`,
    };

    const embed = await createMsg(msgPayload);
    await interaction.editReply({ embeds: [embed] });
    return 'Done';
  },
};
