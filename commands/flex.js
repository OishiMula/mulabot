/* eslint-disable no-unused-vars */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle  } = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const mulaFN = require('../mula_functions');
const secrets = require('../config/secrets');
const api = require('../config/api');
const Blockfrost = require('@blockfrost/blockfrost-js');
const _ = require('lodash');
const Animated_GIF = require('animated_gif');
const ipfsBase = 'https://infura-ipfs.io/ipfs/';
const { createCollage } = require('@mtblc/image-collage');

const blockfrostAPI = new Blockfrost.BlockFrostAPI({
  projectId: secrets.blockfrostToken
});


  //TODO : select menu for addy input
  //TODO : more pages of buttons 


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
    //const filter = m => interaction.user.id === m.author.id;
    let address;
    // let addressValidationRegex = new RegExp('addr1[a-z0-9]+', 'g');
    // First time setup
    await interaction.editReply('Please enter an **addr1** address or **$handle**')

    const filter = m => interaction.user.id === m.author.id;
    const userAddrReply = await interaction.channel.awaitMessages({ filter, time: 25000, max: 1, error: ['time'] })
    // TODO: address validation w/ regex
    // TODO: delete user reply
    address = userAddrReply.first().content;
    userAddrReply.first().delete();

    // Check to see if $handle
    if (address.charAt(0) === '$') address = await getAddressFromHandle(address.slice(1));
    let stakeAddress;
    try {
      stakeAddress = (await blockfrostAPI.addresses(address)).stake_address;
    } catch (error) {
      await interaction.editReply({
        //TODO :  add handle/address
        content: `Sorry! I couldn't find anything for the address:`,
        ephemeral: true
      });
      return "error";
    }
    
    await interaction.editReply({
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
          assetInfo.policyId = jpgPolicyData[project].display_name;
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

    // Get top NFTs
    let count = 1;
    let topNftNames = [];
    for (asset in sortedAssets) {
      topNftNames.push(asset);
      count ++;
      if (count === 6) break;
    }

    // Create the buttons
    const topNfts = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(topNftNames[0])
          .setLabel(topNftNames[0])
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(topNftNames[1])
          .setLabel(topNftNames[1])
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(topNftNames[2])
          .setLabel(topNftNames[2])
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(topNftNames[3])
          .setLabel(topNftNames[3])
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(topNftNames[4])
          .setLabel(topNftNames[4])
          .setStyle(ButtonStyle.Primary),
      );
      
    
    await interaction.editReply({ 
      content: "Done! These are your top five NFTs. Choose one or type the project name you want to flex.", 
      components: [topNfts],
      ephemeral: true
    });

    const buttonFilter = i => {
      i.deferReply();
      i.user.id === interaction.user.id;
    }

    let choice = await interaction.channel.awaitMessageComponent({ buttonFilter, ComponentType: ComponentType.Button, max: 1 })
    
    await interaction.editReply({
      content: `Got it, your choice was: **${choice.customId}**`,
      components: [],
      ephemeral: true
    });

    // Extracting the images for the gif
    let blockfrostImages = []
    let blockfrostDownload;
    for (asset in sortedAssets[choice.customId]) {
      await interaction.editReply({
        content: `**${choice.customId}** Image ${asset} out of ${sortedAssets[choice.customId].length} processed.`,
        ephemeral: true
      })
      blockfrostDownload = await blockfrostAPI.assetsById(sortedAssets[choice.customId][asset].hex)
      blockfrostImages.push(`${ipfsBase}${blockfrostDownload.onchain_metadata.image.slice(7)}`)
    }

    await interaction.editReply({
      content: `Finished **${choice.customId}**. Please wait.`,
      ephemeral: true
    });

    const collageWidth = 1000;
    let flexImage = await createCollage(blockfrostImages, collageWidth)

    await interaction.channel.send({
      content: `Here you go ${interaction.user}`,
      files: [{
        attachment: flexImage,
        name: 'flex.jpg'
      }]
    });

    return 'done';

  }
}