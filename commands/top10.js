const {
  SlashCommandBuilder
} = require('@discordjs/builders');
const mulaFN = require('../mula_functions');
const ordinal = require('ordinal')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top10')
    .setDescription('Retrieve the Top 10 ATH sales on a project')
    .addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true)),
  async execute(interaction) {
    let projectName = interaction.options.getString('project').toLowerCase();

    // shortcut check
    if (projectName in mulaFN.SHORTCUTS) {
      projectName = mulaFN.SHORTCUTS[projectName];
    }

    // retrieve data
    const project = await mulaFN.download(projectName, 'project');
    if (project === "error") return ['error', projectName];

    const imgURL = await mulaFN.download(`${mulaFN.opencnftPolicyAPI}${project.policy_id}`, 'thumbnail');
    const openCNFTData = await mulaFN.download(`${mulaFN.opencnftPolicyAPI}${project.policy_id}/transactions?order=price`, 'data');
    const projectATHSales = openCNFTData['items'].slice(0, 10);

    // format data for message
    function saleMsg(sale) {
      let msg = ''
      for (let i = 0; i < sale.length; i += 1) {
        msg += `**${ordinal(i + 1)}** ${sale[i].unit_name} **||** Price :₳**${Number(sale[i].price / 1000000)}**\n`
      }
      return msg;
    }

    const msgPayload = {
      title: 'Top 10',
      source: 'opencnft',
      header: project.display_name,
      content: saleMsg(projectATHSales),
      thumbnail: `${mulaFN.ipfsBase}${imgURL}`
    }

    const embed = await mulaFN.createMsg(msgPayload);

    await interaction.editReply({
      embeds: [embed]
    });
    return project.display_name;
  }
}