const {
  SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} = require('discord.js');
const {
  download, shortcutCheck, choose, crewCheck, createMsg, CREW,
} = require('../mula_functions');
const {
  opencnftPolicy, jpgCollection, jpgStore, ipfsBase,
} = require('../config/api');
const { hypeMultipler } = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('floor')
    .setDescription('Retrieve the floor price')
    .addStringOption((option) => option.setName('project').setDescription('Enter a project name').setRequired(true)),
  async execute(interaction) {
    let projectName = interaction.options.getString('project').toLowerCase();
    let row;

    // crew check - fun sayings
    if (crewCheck(projectName)) {
      console.log(`Command: Floor | Crew - ${projectName} -- ${interaction.user.tag}`);
      await interaction.editReply(`${projectName} - ${choose(CREW[projectName])}`);
      return 'Done';
    }

    projectName = await shortcutCheck(projectName);

    const project = await download(projectName, 'project');
    if (project === 'error') return ['error', projectName];

    // Get CNFT Project Image
    const imgURL = await download(`${opencnftPolicy}${project.policy_id}`, 'thumbnail');

    // Retrieve floor
    const jpgFloorJ = await download(`${jpgCollection}${project.policy_id}/floor`, 'data');
    const floorPrice = String(jpgFloorJ.floor / 1000000);

    const msgPayload = {
      title: 'Floor',
      source: 'jpg',
      header: project.display_name,
      content: `Floor price: **₳${floorPrice}**
      [jpg.store link](${jpgStore}${project.url})`,
      thumbnail: `${ipfsBase}${imgURL}`,
    };

    if (floorPrice < 30) {
      row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('hype')
            .setLabel('HYPE')
            .setStyle(ButtonStyle.Primary),
        );
    }

    const embed = await createMsg(msgPayload);
    await interaction.editReply({
      embeds: [embed],
      components: ((row === undefined) ? [] : [row]),
    });

    if (row !== undefined) {
      let hypeFlag = 1;
      await interaction.channel.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 5000,
      }).catch(() => { hypeFlag = 0; });
      
      if (hypeFlag === 0) {
        await interaction.editReply({ components: [] });
      } else {
        const hypeFloorPrice = hypeMultipler === 1 ? 'WAIT- NO HYPE! Your shit is at ₳8 rugpull status.' : String((jpgFloorJ.floor / 1000000) * hypeMultipler);
        msgPayload.content = `Floor price: **₳${hypeFloorPrice}**\n[jpg.store link](${jpgStore}${project.url})`;
        msgPayload.title = 'HYPED floor';
        msgPayload.source = 'me';
        const hypeEmbed = await createMsg(msgPayload);
        await interaction.editReply({ embeds: [hypeEmbed], components: [] });
        return `hyped ${project.display_name}`;
      }
    }
    return project.display_name;
  },
};
