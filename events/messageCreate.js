const chalk = require('chalk');
const randomFile = require('select-random-file');
const { Tenor, incInteractions } = require('../mula_functions');
const {
  twitterAltUserId, twitterAltChannel, newTweet, twitterReacts,
} = require('../config/config');
const { SQL } = require('../db');

const extrasPath = './extras/';
const coolDown = new Set();

async function log(msg, meme) {
  console.log(chalk.green(`meme: ${chalk.yellow(meme)} | ${msg.author.username}`));
  incInteractions(msg);
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const messageContent = message.content.toLowerCase();

    // Twitter Function
    if (messageContent.includes('https://twitter.com') || messageContent.includes('https://www.twitter.com')) {
      const twitterChannels = await SQL('configs').select('twitterchannel')
        .where({ guildid: message.guild.id }).first();
      const { twitterchannel } = twitterChannels;
      const discordChannel = message.client.channels.cache.get(twitterchannel);
      // TODO: fix this zeru line down the line
      if (message.author.id === twitterAltUserId) message.client.channels.cache.get(twitterAltChannel).send(`${newTweet} ${message.author.username}\n${message.content}`);
      else discordChannel.send(`${newTweet} ${message.author.username}\n${message.content}`);
      twitterReacts.forEach((reaction) => message.react(reaction));
      console.log(chalk.green(`info: new tweet shared from: ${message.author.username}`));
      incInteractions(message);
      return;
    }

    const gifToggle = await SQL('configs').select('gifs')
      .where({ guildid: message.guildId }).first();
    if (gifToggle.gifs === 1) {
      const gifs = await SQL('gifs').select('giftrigger', 'gifsearch')
        .where({ gid: message.guildId });
      const gifTriggers = gifs.map((g) => g.giftrigger);
      if (messageContent.split(' ').some((match) => gifTriggers.includes(match))) {
        const splitMessage = messageContent.split(' ');
        const matchMessage = splitMessage.filter((match) => gifTriggers.includes(match));

        for (const match of Object.keys(matchMessage)) {
          const search = (gifs.find((g) => g.giftrigger === matchMessage[match])).gifsearch;
          Tenor.Search.Query(search, '50').then((results) => {
            const randomGif = results[Math.floor(Math.random() * results.length)];
            message.channel.send(randomGif.url);
          });
          if (match === '20') break;
        }
        log(message, 'random gifs');
      }
    }

    if (messageContent === 'drop the beat') {
      log(message, 'drop the beat');
      message.channel.send({
        files: [{
          attachment: `${extrasPath}herewego.gif`,
          name: 'hereweGO.gif',
        },
        {
          attachment: `${extrasPath}brunch_for_dinner.mp3`,
          name: 'brunch_for_dinner.mp3',
        }],
      });
    }

    if (messageContent.split(' ').includes('sheesh')) {
      log(message, 'sheesh');
      message.channel.send({
        files: [{
          attachment: `${extrasPath}sheesh.mp3`,
          name: 'sheesh.mp3',
        }],
      });
    }

    if (messageContent.split(' ').includes('bitconnect')) {
      log(message, 'bitconnect');
      message.channel.send({
        content: 'Did someone say.. bitconnect?',
        files: [{
          attachment: `${extrasPath}bitconnnnnnnnect.mp3`,
          name: 'BITCONNNNNNNNNNNNNNNECT.mp3',
        }],
      });
    }

    if (messageContent.includes('real kong shit') || messageContent.includes(':harambehorny:')) {
      log(message, 'real kong shit');
      message.channel.send({
        files: [{
          attachment: `${extrasPath}realkongshit.mp4`,
          name: 'realkongshitbyplxce.mp4',
        }],
      });
    }

    if (messageContent.split(' ').includes('puta')) {
      log(message, 'puta');
      message.channel.send({
        files: [{
          attachment: `${extrasPath}puta.gif`,
          name: 'malditaPUTAcono.gif',
        }],
      });
    }

    if (messageContent.includes('mini messi') || messageContent.includes('messi')) {
      log(message, 'messi');
      const minimessiDir = `${extrasPath}/messi`;
      randomFile(minimessiDir, (Err, minimessiGif) => {
        message.channel.send({
          files: [{
            attachment: `${minimessiDir}/${minimessiGif}`,
            name: 'minimessi.gif',
          }],
        });
      });
    }

    // Oishi
    if (message.content.toLowerCase().split(' ').includes('oishi')
      || message.content.toLowerCase().split(' ').includes('usagi')) {
      if (coolDown.has(message.author.id)) return;
      coolDown.add(message.author.id);
      setTimeout(() => coolDown.delete(message.author.id), 30000);

      log(message, 'oishi | usagi');
      const oishiDir = `${extrasPath}/ss`;
      randomFile(oishiDir, (Err, oishiGif) => {
        message.channel.send({
          files: [{
            attachment: `${oishiDir}/${oishiGif}`,
            name: 'OISHIusagi.png',
          }],
        });
      });
    }

    // juan
    if (messageContent.split(' ').includes('juan')) {
      if (coolDown.has(message.author.id)) return;
      coolDown.add(message.author.id);
      setTimeout(() => coolDown.delete(message.author.id), 30000);

      log(message, 'juan');
      message.channel.send({
        files: [{
          attachment: `${extrasPath}juan.gif`,
          name: 'juanbby.gif',
        }],
      });
    }
  },
};
