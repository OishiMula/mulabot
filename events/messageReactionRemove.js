const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
const nodeEmoji = require('node-emoji');
const { timeNow, logger } = require('../mula_functions');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (reaction.message.id !== '1004974668912009327') return;

    let emoji;
    switch (reaction.emoji.name) {
      case '🌞':
        emoji = '🌞'; break;
      case '🐇':
        emoji = '🐇'; break;
      case '⚔️':
        emoji = '⚔️'; break;
      case '🐱':
        emoji = '🐱'; break;
      case '🦉':
        emoji = '🦉'; break;
      case '👻':
        emoji = '👻'; break;
      case '🍪':
        emoji = '🍪'; break;
      case '🦩':
        emoji = '🦩'; break;
      case '🦆':
        emoji = '🦆'; break;
      case '📘':
        emoji = '📘'; break;
      default: break;
    }

    const logMessage = chalk.green(`info: ${chalk.yellow('reaction role removed:')} ${emoji} - id: ${user.tag}`);
    console.log(timeNow() + logMessage);
    logger.info(stripAnsi(nodeEmoji.unemojify(logMessage)));
  },
};
