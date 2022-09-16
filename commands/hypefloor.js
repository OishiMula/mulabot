const { SlashCommandBuilder } = require('discord.js');
const { shortcutCheck, download, createMsg } = require('../mula_functions');
const {
  opencnftPolicy, jpgCollection, jpgStore, ipfsBase,
} = require('../config/api');
const { hypeMultipler } = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hypefloor')
    .setDescription('When you need to feel really really good')
    .addStringOption((option) => option.setName('project').setDescription('Enter a project name').setRequired(true)),
  async execute(interaction) {
    let projectName = interaction.options.getString('project').toLowerCase();

    projectName = await shortcutCheck(projectName);

    // Retrieve proeject name <--> PolicyID match
    const project = await download(projectName, 'project');
    if (project === 'error') return ['error', projectName];

    // Get CNFT Project Image
    const imgURL = await download(`${opencnftPolicy}${project.policy_id}`, 'thumbnail');

    // Retrieve floor
    const jpgFloorJ = await download(`${jpgCollection}${project.policy_id}/floor`, 'data');
    const floorPrice = hypeMultipler === 1 ? 'WAIT- NO HYPE! Your shit is at ₳8 rugpull status.' : String((jpgFloorJ.floor / 1000000) * hypeMultipler);

    const msgPayload = {
      title: 'HYPE Floor',
      source: 'jpg',
      header: project.display_name,
      content: `Floor price: **₳${floorPrice}**
      [jpg.store link](${jpgStore}${project.url})`,
      thumbnail: `${ipfsBase}${imgURL}`,
    };
    const embed = await createMsg(msgPayload);

    await interaction.editReply({
      embeds: [embed],
    });
    return project.display_name;
  },
};
