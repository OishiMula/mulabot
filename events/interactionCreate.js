const chalk = require('chalk');
const { choose, incInteractions, ERROR_SAYINGS } = require('../mula_functions');
const { ephemeralCommands } = require('../config/config');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Command Handler
    if (!interaction.isCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // Start a timer to see how long the command takes
    const t0 = performance.now();

    // If it's a command that needs to be sent quietly, else do a regular command
    if (ephemeralCommands.includes(interaction.commandName)) {
      await interaction.deferReply({
        interaction,
        ephemeral: true,
      });
    } else await interaction.deferReply();

    // Start the command, userInput is the end result for the try block - either pass or fail
    let userInput = await command.execute(interaction);

    try {
      if (userInput[0] === undefined) userInput = 'n/a';
      if (userInput[0] === 'error') throw new Error();
      const t1 = performance.now();
      console.log(chalk.green(`command: ${chalk.yellow(interaction.commandName)} - ${chalk.yellow(userInput)}\nfrom: ${chalk.blue(interaction.user.tag)} | Time: ${chalk.blue((t1 - t0).toFixed(5))}ms`));
    } catch (error) {
      const t1 = performance.now();
      await interaction.editReply(`I couldn't find ${userInput[1]} -- ${choose(ERROR_SAYINGS)}`);
      console.error(chalk.red(`error: ${chalk.magenta(interaction.commandName)} - ${chalk.magenta(userInput[1])}\nfrom: ${chalk.blue(interaction.user.tag)} | Time: ${chalk.blue((t1 - t0).toFixed(5))}ms`));
    }

    await incInteractions(interaction);
  },
};
