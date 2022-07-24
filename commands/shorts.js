const {
  SlashCommandBuilder
} = require('@discordjs/builders');
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shorts')
    .setDescription('See shortcuts available.'),

  async execute(interaction) {
    function shortsMsg() {
      let msg = '';
      for (let [key, value] of Object.entries(mulaFN.SHORTCUTS))  msg += `${key} -- ${value}\n`;
      return msg;
    }

    const msgPayload = {
      title: 'Shortcuts',
      source: "Mula Bot",
      header: "Shortcuts available",
      content: shortsMsg(),
      thumbnail: `${mulaFN.MULA_BOT_IMG}`
    }

    const embed = await mulaFN.createMsg(msgPayload);
    await interaction.editReply({
      embeds: [embed],
    });
    return 'Done';
  }
}