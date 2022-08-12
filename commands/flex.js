const { ActionRowBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, SelectMenuBuilder } = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const secrets = require('../config/secrets');
const api = require('../config/api');
const Blockfrost = require('@blockfrost/blockfrost-js');
const _ = require('lodash');
//const Animated_GIF = require('animated_gif');
const ipfsBase = 'https://cloudflare-ipfs.com/ipfs/';
const { createCollage } = require('@mtblc/image-collage');
const Keyv = require('keyv');
const keyv = new Keyv('redis://localhost:6379/0');
keyv.on('error', err => console.error('ERROR: Keyv connection error:', err));


const blockfrostAPI = new Blockfrost.BlockFrostAPI({
  projectId: secrets.blockfrostToken
});

// Functions
async function getAddressFromHandle(handle) {
  // Code from Adahandle Api Docs
  // Link: https://docs.adahandle.com/reference/api-reference/cardano-node 
  const handleName = handle;
  const policyID = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';
  
  // A blank Handle name should always be ignored.
  if (handleName.length === 0) {
    console.error(`ERROR: Blank $handle`)
    return 'error';
  }
  
  // Convert handleName to hex encoding.
  const assetName = Buffer.from(handleName).toString('hex');
  
  // Fetch matching address for the asset.
  const data = await fetch(
    `https://cardano-mainnet.blockfrost.io/api/v0/assets/${policyID}${assetName}/addresses`,
    {
      headers: {
        project_id: secrets.blockfrostToken,
        'Content-Type': 'application/json'
      }
    }
  ).then(res => res.json());
  
  if (data?.error) {
    console.error(`ERROR: ${handle} $handle not found.`)
    return 'error';
  }
  
  const [{ address }] = data;
  return address;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('flex')
		.setDescription('Flex those cNFTs. Send this command to start.'),
	async execute(interaction) {
    let address;
    // First time setup
    // Pop up modal
    const modal = new ModalBuilder()
      .setCustomId('flextitle')
      .setTitle('Mula Bot Flex Time');

    const addressInput = new TextInputBuilder()
      .setCustomId('userAddress')
      .setLabel('Please enter an addr1 or $handle')
      .setStyle(TextInputStyle.Short);

    const inputActionRow = new ActionRowBuilder().addComponents(addressInput);
    modal.addComponents(inputActionRow);
    await interaction.showModal(modal);
    const modalFilter = i => i.customId === "userAddress";
    const flexInteraction = await interaction.awaitModalSubmit({ modalFilter, time: 25000 })
    address = flexInteraction.fields.getTextInputValue('userAddress');
    
    // Check to see if $handle
    if (address.charAt(0) === '$') address = await getAddressFromHandle(address.slice(1));
    let stakeAddress;
    try {
      stakeAddress = (await blockfrostAPI.addresses(address)).stake_address;
    } catch (error) {
      await flexInteraction.reply({
        content: `Sorry! I couldn't find anything for the address`,
        ephemeral: true
      });
      return "error";
    }
    
    await flexInteraction.reply({
      content: `Thanks for that, please wait while I'm checking what you have.`, 
      ephemeral: true
    });
    let assets = [];
    let downloadedAssets;
    // Retrieve all assets
    for (let pageNum = 1; ; pageNum++) {
      downloadedAssets = await blockfrostAPI.accountsAddressesAssets(stakeAddress, { page: pageNum });

      if (downloadedAssets.length > 1) {
        assets.push(downloadedAssets);
      }

      else {
        assets = assets.flat(10);
        break;
      }
    }
    
    // cache Jpg store
    // include Redis soon
    let jpgPolicyData = [];
    for (let num = 1; ; num++) {
      let jpgPage = `${api.jpgPolicy}${num}`;
      let jpgResponse = await fetch(jpgPage);
      let jpgData = await jpgResponse.json();
    
      if (jpgData.length > 0) jpgPolicyData = [...jpgPolicyData, ...jpgData]
      else break;
    }

    let assetData = [];
    let asset, assetInfo;
    for (asset in assets) {
      let assetHex = assets[asset].unit;
      assetInfo = Blockfrost.parseAsset(assets[asset].unit);
      assetInfo.hex = assetHex;

      for (let project in jpgPolicyData) {
        if (assetInfo.policyId === jpgPolicyData[project].policy_id) {
          assetInfo.policyId = jpgPolicyData[project].display_name.toLowerCase();
          assetData.push(assetInfo);
          break;
        }
      }
    }

    const groupedAssets = _.groupBy(assetData, project => project.policyId);

    // Sort by Most NFTs to Least
    const sortAssets = Object.entries(groupedAssets).sort((a, b) => { return b[1].length - a[1].length; });
    const sortedAssets = {};
    for (let i = 0; i < sortAssets.length; i++) {
      sortedAssets[sortAssets[i][0]] = sortAssets[i][1];
    }

    // Create the buttons
    let count = 0;
    //let nftAmount = Object.keys(sortedAssets).length;
    /* old code
    let topNftRow = new ActionRowBuilder()
    let BottomNftRow = new ActionRowBuilder()
    */
    // new code, select menu
    let nftOptions = new ActionRowBuilder()
      .addComponents(
        new SelectMenuBuilder()
          .setCustomId(asset)
          .setPlaceholder('Select a CNFT Collection')
      )
    for (asset in sortedAssets) {
      count ++;
      nftOptions.components[0].addOptions(
        {
          label: asset,
          description: `Number of NFTs: ${sortedAssets[asset].length}`,
          value: asset
        }
      )
      if (count === 25) break;
    }
    
    await flexInteraction.editReply({ 
      content: "Done! These are your top cNFTs. Choose it to flex it.", 
      components: [nftOptions],
      ephemeral: true
    });

    let errorFlag = 0;
    const selectFilter = i => i.user.id === interaction.user.id;
    let choice = await interaction.channel.awaitMessageComponent({ selectFilter, componentType: ComponentType.SelectMenu, time: 10000 })
      .catch(() => {
        flexInteraction.editReply({
          content: `You didn't make a choice in time, try again.`,
          components: [],
          ephemeral: true
        });
        errorFlag = 1;
      })
    if (errorFlag === 1) return 'error';


    await flexInteraction.editReply({
      content: `Got it, your choice was: **${choice.values[0]}**`,
      components: [],
      ephemeral: true
      });

    // Extracting the images for the gif
    let blockfrostImages = []
    let blockfrostDownload;

    for (asset in sortedAssets[choice.values[0]]) {
      await flexInteraction.editReply({
        content: `**${choice.values[0]}** Image ${asset} out of ${sortedAssets[choice.values[0]].length} processed.`,
        ephemeral: true
      })
    
      blockfrostDownload = await blockfrostAPI.assetsById(sortedAssets[choice.values[0]][asset].hex)
      blockfrostImages.push(`${ipfsBase}${blockfrostDownload.onchain_metadata.image.slice(7)}`)    
    }

    await flexInteraction.editReply({
      content: `Finished **${choice.values[0]}**. Please wait. This may take a bit.`,
      ephemeral: true
    });

    const collageWidth = 2000;
    let flexImage;
    try {
      flexImage = await createCollage(blockfrostImages, collageWidth)
    } catch (error) {
      console.error(`ERROR: Photo Collage.\n${error}`)
      return "error";
    }
   
    await interaction.channel.send({
      content: `Here you go ${interaction.user}`,
      files: [{
        attachment: flexImage,
        name: `flex${interaction.user.id}${choice.values[0]}.jpg`
      }]
    });

    return 'done';

  }
}