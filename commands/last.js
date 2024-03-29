const { SlashCommandBuilder } = require('discord.js');
const dayjs = require('dayjs');
const ordinal = require('ordinal');
const relativeTime = require('dayjs/plugin/relativeTime');
const { download, createMsg, shortcutCheck } = require('../mula_functions');
const {
  opencnftPolicy, jpgProject, ipfsBase, jpgAsset,
} = require('../config/api');

dayjs.extend(relativeTime);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('last')
    .setDescription('Retrieve the last # sales made')
    .addStringOption((option) => option.setName('project').setDescription('Enter a project name').setRequired(true))
    .addIntegerOption((option) => option.setName('amount').setDescription('Retrieve the last # sales made').setMinValue(1).setMaxValue(20)),
  async execute(interaction) {
    let projectName = interaction.options.getString('project');
    projectName = await shortcutCheck(projectName);

    const amount = interaction.options.getInteger('amount') ?? 6;

    // Retrieve project name <--> PolicyID match
    const project = await download(projectName, 'project');
    if (project === 'error') return ['error', projectName];

    // Get CNFT Project Image
    const imgURL = await download(`${opencnftPolicy}${project.policy_id}`, 'thumbnail');

    // Retrieve recent sales
    const jpgSalesData = await download(`${jpgProject}${project.policy_id}/sales?page=1`, 'data');
    // const jpgSalesData = jpgSalesJ.slice(0, amount);

    const msgPayload = {
      title: `Last ${amount} ${project.display_name} Sales`,
      source: 'jpg',
      header: project.display_name,
      thumbnail: `${ipfsBase}${imgURL}`,
    };

    const messages = [];
    let successfulListings = 0;
    for (const num of Object.keys(jpgSalesData)) {
      if (successfulListings === amount) break;
      const {
        display_name, price_lovelace, confirmed_at, asset_id,
      } = jpgSalesData[num];
      const purchased = dayjs(confirmed_at).fromNow();
      if (purchased === 'NaN years ago') continue; // purchased = 'n/a time ago';
      messages.push({
        name: `[${ordinal(Number(successfulListings) + 1)}] ${display_name}`,
        value: `₳${Number(price_lovelace / 1000000)} :: [${purchased.substring(0, purchased.length - 4)}](${jpgAsset}${asset_id})`,
        inline: true,
      });
      successfulListings++;
    }

    const embed = await createMsg(msgPayload, messages);
    await interaction.editReply({ embeds: [embed] });
    return project.display_name;
  },
};
