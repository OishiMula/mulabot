const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle  } = require('discord.js');
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
    let nftAmount = Object.keys(sortedAssets).length;
    let topNftRow = new ActionRowBuilder()
    let BottomNftRow = new ActionRowBuilder()

    for (asset in sortedAssets) {
      count ++;
      // Manual Project Prompt
      if (count === nftAmount || count === 10) {
        BottomNftRow.addComponents(
          new ButtonBuilder()
            .setCustomId('manual')
            .setLabel('Other NFT...')
            .setStyle(ButtonStyle.Success)
        );
      }

      if (count <= 5) {
        topNftRow.addComponents(
          new ButtonBuilder()
            .setCustomId(asset)
            .setLabel(asset.slice(0, 25))
            .setStyle(ButtonStyle.Primary)
        );
      }
      else if (count <= 9) {
        BottomNftRow.addComponents(
          new ButtonBuilder()
            .setCustomId(asset)
            .setLabel(asset.slice(0, 25))
            .setStyle(ButtonStyle.Primary)
        );
      }
      else break;
    }
    
    await flexInteraction.editReply({ 
      content: "Done! These are your top cNFTs. Choose it to flex it. Other NFT to enter one manually.", 
      components: [topNftRow, BottomNftRow],
      ephemeral: true
    });

    const buttonFilter = i => {
      i.deferReply();
      i.user.id === interaction.user.id;
    }

    let errorFlag = 0;
    let choice = await interaction.channel.awaitMessageComponent({ buttonFilter, ComponentType: ComponentType.Button, max: 1, time: 15000 })
      .catch(() => {
        flexInteraction.editReply({
          content: `You didn't make a choice in time, try again.`,
          components: [],
          ephemeral: true
        });
        errorFlag = 1;
      })
    if (errorFlag === 1) return 'error';
    
    // To enter a project manually
    if (choice.customId === 'manual') {
      await flexInteraction.editReply({ 
        content: "Check the popup!", 
        components: [],
        ephemeral: true
      });

      const manualModal = new ModalBuilder()
        .setCustomId('manualmodal')
        .setTitle('Mula Bot Manual Flex');

      const manualProjectInput = new TextInputBuilder()
        .setCustomId('cnftProject')
        .setLabel('Please enter a cnft project name')
        .setStyle(TextInputStyle.Short);

      const manualActionRow = new ActionRowBuilder().addComponents(manualProjectInput);
      manualModal.addComponents(manualActionRow);
      await choice.showModal(manualModal);
      const manualFilter = i => i.customId === 'cnftProject';
      const manualInteraction = await interaction.awaitModalSubmit({ manualFilter, time: 25000 });
      const manualProject = manualInteraction.fields.getTextInputValue('cnftProject');
      choice.customId = manualProject.toLowerCase();

      await manualInteraction.reply({
        content: `Thank you, please wait.`,
        ephemeral: true
      });
    }


    await flexInteraction.editReply({
      content: `Got it, your choice was: **${choice.customId}**`,
      components: [],
      ephemeral: true
      });


    // Extracting the images for the gif
    let blockfrostImages = []
    let blockfrostDownload;

    for (asset in sortedAssets[choice.customId]) {
      await flexInteraction.editReply({
        content: `**${choice.customId}** Image ${asset} out of ${sortedAssets[choice.customId].length} processed.`,
        ephemeral: true
      })
      blockfrostDownload = await blockfrostAPI.assetsById(sortedAssets[choice.customId][asset].hex)
      //blockfrostImages.push(`${ipfsBase}${blockfrostDownload.onchain_metadata.image.slice(7)}`)
      const ipfsImage = `${ipfsBase}${blockfrostDownload.onchain_metadata.image.slice(7)}`;
      let ipfsResponse;
      try {
        ipfsResponse = await fetch(ipfsImage);
      } catch(error) {
        console.error(`ERROR: Fetch\n${error}`)
        asset --;
        continue;
      }
      const ipfsBuffer = await ipfsResponse.arrayBuffer();
      const ipfsArrayBuffer = Buffer.from(ipfsBuffer);
      blockfrostImages.push(ipfsArrayBuffer);
    }

    await flexInteraction.editReply({
      content: `Finished **${choice.customId}**. Please wait. This may take a bit.`,
      ephemeral: true
    });

    const collageWidth = 2000;
    let flexImage;
    try {
      flexImage = await createCollage(blockfrostImages, collageWidth)
    } catch (error) {
      console.log(`ERROR: Photo Collage.\n ${error}`)
      return "error";
    }
   

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