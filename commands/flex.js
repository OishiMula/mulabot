const { SlashCommandBuilder, ActionRowBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mulaFN = require('../mula_functions');
const secrets = require('../config/secrets');
const api = require('../config/api');
const Blockfrost = require('@blockfrost/blockfrost-js');
const _ = require('lodash');
const { createCollage } = require('@mtblc/image-collage');
const Keyv = require('keyv');
const axios = require('axios');
const keyv = new Keyv('redis://localhost:6379/0');
const userIdKeyv = new Keyv('redis://localhost:6379/2');
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
  let response;
  try {
    response = await axios.get(`https://cardano-mainnet.blockfrost.io/api/v0/assets/${policyID}${assetName}/addresses`,
      {
        headers: {
          project_id: secrets.blockfrostToken,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error(`ERROR: ${handle} $handle not found.`)
    return `$${handle}`;
  }

  
  const [{ address }] = response.data;
  return address;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('flex')
		.setDescription('Flex those cNFTs. Send this command to start.'),
	async execute(interaction) {
    // Retrieve the User address & create the prompt. Retrieve the address / $handle
    let address, stakeAddress;
    let flexInteraction = interaction;

    if (await userIdKeyv.get(interaction.user.id)) {

      // Buttons to confirm your wallet or new wallet
      const checkWalletRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('mine')
            .setLabel("My Wallet")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('other')
            .setLabel("Other Wallet")
            .setStyle(ButtonStyle.Danger),
        );

      await flexInteraction.reply({
        content: `I have your wallet on file, do you want to flex yours or another wallet? || Ignore "Interaction failed"`, 
        components: [checkWalletRow],
        ephemeral: true
      });


      const walletFilter = i => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      }

      const walletChoice = await flexInteraction.channel.awaitMessageComponent({ walletFilter, ComponentType: ComponentType.Button, time: 15000 })

      if (walletChoice.customId === 'mine') {
        stakeAddress = await userIdKeyv.get(interaction.user.id);
        address = stakeAddress;
        flexInteraction.editReply({
          content: `Getting your wallet: ${stakeAddress}`,
          components: []
        })
      }

      if (walletChoice.customId === 'other') {
        flexInteraction.editReply({
          content: `Let's get that wallet.`,
          components: []
        })

        const modalFilter = i => i.customId === "userAddress";
        flexInteraction = await interaction.awaitModalSubmit({ modalFilter, time: 60000 });
        address = flexInteraction.fields.getTextInputValue('userAddress').trim();

      }
    }

    if (!address) {
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
      flexInteraction = await interaction.awaitModalSubmit({ modalFilter, time: 60000 })
      address = flexInteraction.fields.getTextInputValue('userAddress').trim();
    }
      
      // Check to see if $handle
      if (address.charAt(0) === '$') address = await getAddressFromHandle(address.slice(1));

      if (!stakeAddress) {
        try {
          stakeAddress = (await blockfrostAPI.addresses(address)).stake_address;
        } catch (error) {
          await flexInteraction.reply({
            content: `Sorry! I couldn't find anything for the address: ${address}`,
            ephemeral: true
          });
          return "error";
        }
      }
      
      try {
        await flexInteraction.reply({
          content: `Thanks for that, please wait while I'm checking what you have.`, 
          ephemeral: true
        });
      } catch(error) {
      {
        await flexInteraction.editReply({
          content: `Thanks for that, please wait while I'm checking what you have.`, 
          ephemeral: true
          });
         }
      }


    // Retrieve all assets
    let assets = [];
    let downloadedAssets;

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

    // Add extra asset information from jpg.store
    if (!await keyv.get('jpgstorecache')) await mulaFN.jpgStoreCacheRefresh();
    const jpgPolicyData = await keyv.get('jpgstorecache');

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

    // Group & Sort by Most NFTs to Least
    const groupedAssets = _.groupBy(assetData, project => project.policyId);
    const sortAssets = Object.entries(groupedAssets).sort((a, b) => { return b[1].length - a[1].length; });
    const sortedAssets = {};
    for (let i = 0; i < sortAssets.length; i++) {
      sortedAssets[sortAssets[i][0]] = sortAssets[i][1];
    }

    // Create the Select menu
    let count = 0;
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
      content: "These are your top cNFTs. Choose it to flex it.", 
      components: [nftOptions],
    });

    let errorFlag = 0;
    const selectFilter = i => i.user.id === interaction.user.id;
    let choice = await interaction.channel.awaitMessageComponent({ selectFilter, componentType: ComponentType.SelectMenu, time: 60000 })
      .catch(() => {
        flexInteraction.editReply({
          content: `You didn't make a choice in time, try again.`,
          components: [],

        });
        errorFlag = 1;
      })
    if (errorFlag === 1) return 'error';


    await flexInteraction.editReply({
      content: `Got it, your choice was: **${choice.values[0]}**`,
      components: [],
      });

    // Extracting the images for the gif
    let blockfrostImages = []
    let blockfrostDownload;

    for (asset in sortedAssets[choice.values[0]]) {
      await flexInteraction.editReply(`**${choice.values[0]}** Image ${asset} out of ${sortedAssets[choice.values[0]].length} retrieved.`)
      
      blockfrostDownload = await blockfrostAPI.assetsById(sortedAssets[choice.values[0]][asset].hex)
      blockfrostImages.push(`${api.ipfsBase}${blockfrostDownload.onchain_metadata.image.slice(7)}`)     
    }

    await flexInteraction.editReply(`Finished **${choice.values[0]}**. Creating the collage now.`);

    // Set up size for collage
    const collageWidth = 1600;
    
    if (blockfrostImages.length > 60) {
      await flexInteraction.editReply(`Finished **${choice.values[0]}**. Creating the collage now.... you have alot, be patient!`);

      let flexImages = [];
      const splitBlockFrostImages = _.array.chunk(blockfrostImages, 60);

      for (let imageSet in splitBlockFrostImages) {
        try {
          flexImages.push(await createCollage(splitBlockFrostImages[imageSet], collageWidth));
        } catch (error) {
          console.error(`Error: Photo Collage.\n${error}`)
          await flexInteraction.editReply(`Oops! I crashed. Sorrrrry... this happens. Blame the blockchain for being too slow!`);
          return "error";
        }
      }

      await interaction.channel.send(`Multiple flexes incoming ${interaction.user}`)
      for (let image in flexImages) {
        await interaction.channel.send({
          files: [{
            attachment: flexImages[image],
            name: `flex${interaction.user.id}${choice.values[0]}.jpg`
          }]
        });
      }
      return 'done'
    }

    let flexImage;
    try {
      flexImage = await createCollage(blockfrostImages, collageWidth)
    } catch (error) {
      console.error(`Error: Photo Collage.\n${error}`)
      await flexInteraction.editReply(`Oops! I crashed. Sorrrrry... this happens. Blame the blockchain for being too slow!`);
      return "error";
    }

    await flexInteraction.editReply(`Finished. Sending your flex now.`);

    await interaction.channel.send({
      content: `Incoming flex from: ${interaction.user}`,
      files: [{
        attachment: flexImage,
        name: `flex${interaction.user.id}${choice.values[0]}.jpg`
      }]
    });
    
    const saveWalletRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('save')
          .setLabel("Save Wallet")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel("Don't Save")
          .setStyle(ButtonStyle.Danger),
    );
    
    // If no wallet is saved.
    if (!await userIdKeyv.get(interaction.user.id)) {
      await flexInteraction.editReply({
        content: `Do you want to save this wallet for quicker access? Ignore the "Interaction failed"`,
        components: [saveWalletRow],
        ephemeral: true,
      });
  
      const saveFilter = i => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      }
  
      interaction.channel.awaitMessageComponent({ saveFilter, ComponentType: ComponentType.Button, time: 15000 })
        .then(i => { 
          if (i.customId === 'save') {
            flexInteraction.editReply({
              content: `You got it! I'll remember your wallet as: ${stakeAddress}`,
              components: [],
              ephemeral: true,
            })
            userIdKeyv.set(interaction.user.id, stakeAddress)
          }
          
          else if (i.customId === 'cancel') {
            flexInteraction.editReply({
              content: `I won't save the wallet.`,
              components: [],
              ephemeral: true,
            })
          }
        })
        .catch(() => {
          flexInteraction.editReply({
            content: "You didn't make a choice in time. I won't save the wallet.",
            components: [],
            ephemeral: true,
          })
        })  
    }

    return 'done';

  }
}