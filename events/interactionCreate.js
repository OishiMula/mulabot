const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const mulaFN = require('../mula_functions');
const config = require('../config/config')
const client = require('../index');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    
    if (interaction.isButton()) {
      // For Flex Save Input
      if (interaction.customId === 'other') {
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
      }
    }
    
    // Command Handler
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
  
    // Start a timer to see how long the command takes
    const t0 = performance.now();
  
    // Quickhack for Flex
    if (interaction.commandName === 'flex') {
      await command.execute(interaction);
      const t1 = performance.now();
      console.log(`Command: ${interaction.commandName} -- ${interaction.user.tag} | Time: ${(t1 - t0).toFixed(5)}ms`)
      return;
    }
  
    // If it's a command that needs to be sent quietly, else do a regular command
    if (config.ephemeralCommands.includes(interaction.commandName)) {
      await interaction.deferReply({
        interaction,
        ephemeral: true
      });
    } else await interaction.deferReply();
  
    // Start the command, userInput is the end result for the try block - either pass or fail
    let userInput = await command.execute(interaction);
  
    try {
      if (userInput[0] === undefined) userInput = 'n/a';
      if (userInput[0] === 'error') throw new Error();
      const t1 = performance.now();
      console.log(`Command: ${interaction.commandName} - ${userInput} -- ${interaction.user.tag} | Time: ${(t1 - t0).toFixed(5)}ms`)
    } catch (error) {
      const t1 = performance.now();
      await interaction.editReply(`I couldn't find ${userInput[1]} -- ${mulaFN.choose(mulaFN.ERROR_SAYINGS)}`);
      console.error(`ERROR: ${interaction.commandName} - ${userInput[1]} -- ${interaction.user.tag} | Time: ${(t1 - t0).toFixed(5)}ms`);
    }
  }

  }