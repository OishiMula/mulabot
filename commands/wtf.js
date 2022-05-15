const { SlashCommandBuilder } = require('@discordjs/builders');
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twtf')
    .setDescription('See commands available. Also, only you can see this. Won\'t spam chat. PROMISE.'),

async execute(interaction) {
  const msgPayload = {
    title : 'You need some help!',
    source : 'Mula Bot',
    header : 'Commands available',
    content : `**/floor *<projectname>*** --> Retrieve floor
**/traitfloor *<name> <trait>*** --> Retrieve the floor on a specific trait
**/efloor *<name>*** --> Retrieve floor from ETH
**/last *<name> <amount>*** --> Retrieve last <amount> of transactions
**/top10 *<name>*** --> Retrieve top ten sales of project
**/top10all** --> Retrieve top ten projects today
**/hypefloor** --> When you need a pick me up
**/toke *<tokenname>*** --> Gets the last price/volume from Museli
**/shorts** --> Shows your shortcuts available for projects / tokens
**/vibe** --> When you just need to vibe a bit
**/addproject** --> Add a project to #upcoming-mints
**/mmm** --> Money Mike Mode, TURN IT UP!
**/wtf** --> This command`,
    thumbnail : `${mulaFN.MULA_BOT_IMG}`
  }

  const embed = await mulaFN.createMsg(msgPayload);
  await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}