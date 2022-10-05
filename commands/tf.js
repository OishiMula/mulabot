const { SlashCommandBuilder } = require('discord.js');
const { download, shortcutCheck, createMsg } = require('../mula_functions');
const { jpgProject } = require('../config/api');
const { pgSQL } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tf')
    .setDescription('Find the lowest price on a trait')
    .addStringOption((option) => option.setName('project').setDescription('Enter a project name').setRequired(true))
    .addStringOption((option) => option.setName('trait').setDescription('Enter the trait').setRequired(true)),

  async execute(interaction) {
    let trait, projectName, project;
    /*  This function searches metadata
        with recursion, allowing for
        deeply nested objects.      */
    function findMatch(val) {
      if (typeof (val) === 'string') {
        if (val.toLowerCase() === trait) {
          return 1;
        }
      } else if (typeof (val) === 'object') {
        const metadataValues = Object.values(val);
        for (const subVal of metadataValues) {
          const match = findMatch(subVal);
          if (match === 1) return 1;
        }
      } else if (Array.isArray(val)) {
        for (const subVal of val) {
          const match = findMatch(subVal);
          if (match === 1) return 1;
        }
      }
      return 0;
    }

    // Once a match is found, format the message for Discord
    async function traitFound(listing, metadata) {
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
    }

    projectName = interaction.options.getString('project').toLowerCase();
    trait = interaction.options.getString('trait').toLowerCase();

    projectName = await shortcutCheck(projectName);
    project = await download(projectName, 'project');
    if (project === 'error') {
      const notFound = ['error', projectName];
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
    SELECT ENCODE(ma.name, 'escape') as asset_name, json->?->ENCODE(ma.name, 'escape') as metadata
    FROM multi_asset ma
    INNER JOIN ma_tx_mint mtm ON ma.id = mtm.ident
    INNER JOIN tx t ON  mtm.tx_id = t.id
    INNER JOIN tx_metadata tm ON t.id = tm.tx_id
    WHERE ma.policy = DECODE(?, 'hex')
    `, [project.policy_id, project.policy_id]);
    const allAssets = {};
    results.rows.forEach((a) => {
      let asset;
      try {
        a.metadata.assetname = a.asset_name;
        asset = {
          [a.metadata.name]: a.metadata,
        };
        Object.assign(allAssets, asset);
      } catch (error) {
        // return;
      }
    });

    for (const listing of sortedListings) {
      const assetName = listing.display_name;
      const metadata = allAssets[assetName];
      for (const v in metadata) {
        if (Object.prototype.hasOwnProperty.call(metadata, v)) {
          const matchFound = findMatch(metadata[v]);
          if (matchFound === 1) {
            await traitFound(listing, metadata);
            return 'Done';
          }
        }
      }
    }
    const notFound = ['error', `project: ${projectName} trait: ${trait}`];
    return notFound;
  },
};
