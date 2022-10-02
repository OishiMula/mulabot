/* eslint-disable */
const { SlashCommandBuilder } = require('discord.js');
const { download, shortcutCheck, createMsg } = require('../mula_functions');
const { opencnftPolicy, jpgProject, jpgStore } = require('../config/api');
const { pgSQL } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tf')
    .setDescription('Find the lowest price on a trait')
    .addStringOption((option) => option.setName('project').setDescription('Enter a project name').setRequired(true))
    .addStringOption((option) => option.setName('trait').setDescription('Enter the trait').setRequired(true)),

  async execute(interaction) {
    let projectName = interaction.options.getString('project').toLowerCase();
    let trait = interaction.options.getString('trait').toLowerCase();
    let match = 0;

    projectName = await shortcutCheck(projectName);
    const project = await download(projectName, 'project');
    if (project === 'error') {
      const notFound = ['error', projectName]; 
      return notFound;
    }
    
    const traitsData = await download(`${opencnftPolicy}${project.policy_id}/asset/trait`, 'data');
    for (const t in traitsData.traits) {
      for (const v in traitsData.traits[t].trait_values) {
        if (traitsData.traits[t].trait_values[v].value.toLowerCase() === trait) {
          trait = traitsData.traits[t].trait_values[v].value;
          match = 1;
          break;
        }
      }
      if (match === 1) break;
    }
    if (match === 0) {
      const notFound = ['error', `${projectName} -  ${trait}`];
      return notFound;
    }

    const listings = [];
    for (let num = 1; ;num++) {
      const listingData = await download(`${jpgProject}${project.policy_id}/listings?page=${num}`, 'data');
      if (listingData.length > 1) {
        listings.push(...listingData);
      } else {
        break;
      }
    }
    const sortedListings = listings.sort((a, b) => a.price_lovelace - b.price_lovelace);
    const results = await pgSQL.raw(`
    SELECT json-> ? as metadata
    FROM multi_asset ma
    INNER JOIN ma_tx_mint mtm ON ma.id = mtm.ident
    INNER JOIN tx t ON  mtm.tx_id = t.id
    INNER JOIN tx_metadata tm ON t.id = tm.tx_id
    WHERE ma.policy = DECODE(?, 'hex')
    `, [project.policy_id, project.policy_id]);
    const allAssets = {};
    results.rows.forEach((a, b) => {
      Object.assign(allAssets, a.metadata);
    });
    for (const listing of sortedListings) {
      const assetName = listing.display_name.replace(/[^a-zA-Z0-9]/g, '')
      const metadata = allAssets[assetName];
      for (const v in metadata) {
        if (metadata[v] === trait) {
          let metaImage = metadata.image;
          const httpPattern = /^(https?|ftp)/;
          if (!httpPattern.test(metaImage)) {
            metaImage = metaImage.slice(7);
            metaImage = `https://oishimula.infura-ipfs.io/ipfs/${metaImage}`;
          }

          const msgPayload = {
            title: `Trait Floor: ${trait}`,
            source: 'jpg',
            header: project.display_name,
            content: `Floor price: **₳${listing.price_lovelace / 1000000}**
            Asset: [${listing.display_name}](https://www.jpg.store/asset/${listing.asset_id})`,
            thumbnail: metaImage,
          };  
          const embed = await createMsg(msgPayload);
          await interaction.editReply({ embeds: [embed] });
          return 'Done';
        }
      }
    }
    const notFound = ['error', projectName];
    return notFound;
  },
};
