const { SlashCommandBuilder } = require('discord.js');
const mulaFN = require('../mula_functions');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wtf')
    .setDescription('See commands available. Also, only you can see this. Won\'t spam chat. PROMISE.'),

  async execute(interaction) {
    const msgPayload = {
      title: 'You need some help!',
      source: 'Mula Bot',
      header: 'Commands available',
      content: `**/floor *<projectname>*** --> Retrieve floor
      **/traitfloor *<name> <trait>*** --> Retrieve the floor on a specific trait [sry not working rn]
      **/efloor *<name>*** --> Retrieve floor from ETH [samesies]
      **/last *<name> <amount>*** --> Retrieve last <amount> of transactions
      **/top10 *<name>*** --> Retrieve top ten sales of project
      **/top10all** --> Retrieve top ten projects today
      **/hypefloor** --> When you need a pick me up
      **/shorts** --> Shows your shortcuts available for projects / tokens
      **/vibe** --> When you just need to vibe a bit
      **/wtf** --> This command`,
      thumbnail: `${config.botIcon}`
    }

    const embed = await mulaFN.createMsg(msgPayload);
    await interaction.editReply({
      embeds: [embed],
    });
    return 'Done';
  }
}