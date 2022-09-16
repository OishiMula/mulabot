const { SlashCommandBuilder } = require('discord.js');
const ordinal = require('ordinal');
const dayjs = require('dayjs');
const { download, shortcutCheck, createMsg } = require('../mula_functions');
const { jpgAsset, opencnftPolicy, ipfsBase } = require('../config/api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Retrieve the Top 10 ATH sales on a project')
    .addStringOption((option) => option.setName('project').setDescription('Enter a project name').setRequired(true)),
  async execute(interaction) {
    let projectName = interaction.options.getString('project').toLowerCase();

    projectName = await shortcutCheck(projectName);

    // retrieve data
    const project = await download(projectName, 'project');
    if (project === 'error') return ['error', projectName];

    const imgURL = await download(`${opencnftPolicy}${project.policy_id}`, 'thumbnail');
    const openCNFTData = await download(`${opencnftPolicy}${project.policy_id}/transactions?order=price`, 'data');
    const projectATHSales = openCNFTData.items.slice(0, 10);

    const msgPayload = {
      title: 'Top 10 Sales - All Time',
      source: 'opencnft',
      header: project.display_name,
      thumbnail: `${ipfsBase}${imgURL}`,
    };

    const messages = [];
    for (const num of Object.keys(projectATHSales)) {
      const {
        unit_name, price, unit, sold_at,
      } = projectATHSales[num];
      const purchased = dayjs.unix(sold_at).format('M/D/YY');
      if (num === '0') msgPayload.thumbnail = `${ipfsBase}${projectATHSales[num].thumbnail.thumbnail.slice(7)}`;
      messages.push({
        name: `[${ordinal(Number(num) + 1)}] ${unit_name}`,
        value: `**₳${Number(price / 1000000)}** :: [${purchased}](${jpgAsset}${unit})`,
        inline: true,
      });
    }

    const embed = await createMsg(msgPayload, messages);
    await interaction.editReply({ embeds: [embed] });
    return project.display_name;
  },
};
