const { twitterAltUserId, twitterAltChannel, newTweet, twitterReacts } = require('../config/config');
const { Tenor } = require('../mula_functions');
const { configsDB, gifsDB } = require('../db');
const chalk = require('chalk');
const extrasPath = './extras/';
const randomFile = require('select-random-file');


module.exports = {
  name: 'messageCreate',
  async execute(message) {  
    if (message.author.bot) return;
  
    let messageContent = message.content.toLowerCase();

    // Linguini L take
    /*
    if (message.author.id === '932913898473013268') {
      Tenor.Search.Query('L', "50").then(results => {
        const randomGif = results[Math.floor(Math.random() * results.length)];
        message.reply(randomGif.url);    
      })
    }
    */

    // Filter somoene
    /*
    if (message.author.id === '639648169663266839' && (messageContent.includes('oishi') || messageContent.includes('oish'))) {
      message.delete();
      message.channel.send('Be good bitch.');
      console.log(`Command: Delete Banch Fud`)
    }
    */

    // Twitter Function
    // This will retrieve messages that include a tweet link, add fun reacts, and repost it in a separate channel
    // There is an option for secondary post to go to a specific channel (ie, admin posting tweets)
    if (messageContent.includes('https://twitter.com') || messageContent.includes('https://www.twitter.com')) {
      const twitterChannels = await configsDB.findOne({ attributes: ['twitterchannel'], where: { guildid: message.guild.id }, raw: true });
      const { twitterchannel } = twitterChannels;
      const discordChannel = message.client.channels.cache.get(twitterchannel);
      // TODO: fix this zeru line down the line
      if (message.author.id === twitterAltUserId) message.client.channels.cache.get(twitterAltChannel).send(`${newTweet} ${message.author.username}\n${message.content}`); 
      else discordChannel.send(`${newTweet} ${message.author.username}\n${message.content}`);
      twitterReacts.forEach(reaction => message.react(reaction));
      return; 
    }

    // Plxce Beats
    if (messageContent === "drop the beat") {
      console.log(`Command: Drop the beat -- ${message.author.tag}`)
      message.channel.send({
        files: [{
            attachment: `${extrasPath}herewego.gif`,
            name: `hereweGO.gif`
          },
          {
            attachment: `${extrasPath}brunch_for_dinner.mp3`,
            name: `brunch_for_dinner.mp3`
          }
        ]
      });
    }


    // Random gifs
    const gifToggle = await configsDB.findOne({ attributes: ['gifs'], where: { guildid: message.guildId }, raw: true });
    if (gifToggle.gifs === 1) {
      const gifs = await gifsDB.findAll({ attributes: ['giftrigger', 'gifsearch'], where: { gid: message.guildId }, raw: true });
      const gifTriggers = gifs.map(g => g.giftrigger);

      if (messageContent.split(" ").some(match => gifTriggers.includes(match))) {
        const splitMessage = messageContent.split(" ");
        const matchMessage = splitMessage.filter(match => gifTriggers.includes(match));

        for (let match in matchMessage) {
          const search = (gifs.find(g => g.giftrigger === matchMessage[match])).gifsearch;
          Tenor.Search.Query(search, "50").then(results => {
            const randomGif = results[Math.floor(Math.random() * results.length)];
            message.channel.send(randomGif.url);
          })
          if (match === '20') break;
        }
        console.log(chalk.green(`gif: ${chalk.yellow(matchMessage.toString())} | ${message.author.tag}`));
      }
    }

   

    // Sheesh
    if (messageContent.split(" ").includes('sheesh')) {
      console.log(`Command: Sheesh -- ${message.author.tag}`)
      message.channel.send({
        files: [{
          attachment: `${extrasPath}sheesh.mp3`,
          name: `sheesh.mp3`
        }]
      });
    }

    // bitconnect
    if (messageContent.split(" ").includes('bitconnect')) {
      console.log(`Command: Bitconnect -- ${message.author.tag}`)
      message.channel.send({
        content: "Did someone say.. bitconnect?",
        files: [{
          attachment: `${extrasPath}bitconnnnnnnnect.mp3`,
          name: `BITCONNNNNNNNNNNNNNNECT.mp3`
        }]
      });
    }

    // real kong shit
    if (messageContent.includes('real kong shit') || messageContent.includes(':harambehorny:')) {
      console.log(`Command: Real kong shit -- ${message.author.tag}`)
      message.channel.send({
        files: [{
          attachment: `${extrasPath}realkongshit.mp4`,
          name: `realkongshitbyplxce.mp4`
        }]
      });
    }

    // Puta
    if (messageContent.split(" ").includes('puta')) {
      console.log(`Command: Puta -- ${message.author.tag}`)
      message.channel.send({
        files: [{
          attachment: `${extrasPath}puta.gif`,
          name: `malditaPUTAcono.gif`
        }]
      });
    }

    // mini messi
    if (messageContent.includes("mini messi") || messageContent.includes('messi')) {
      console.log(`Command: Mini Messi -- ${message.author.tag}`)
      const minimessiDir = `${extrasPath}/messi`
      randomFile(minimessiDir, (Err, minimessiGif) => {
        message.channel.send({
          files: [{
            attachment: `${minimessiDir}/${minimessiGif}`,
            name: `minimessi.gif`
          }]
        });
      });
    }

    // Oishi
    /*
    if (message.content.toLowerCase().split(" ").includes('oishi') || message.content.toLowerCase().split(" ").includes('usagi')) {
      console.log(`Command: Oishi -- ${message.author.tag}`)
      const oishiDir = `${extrasPath}/ss`
      randomFile(oishiDir, (Err, oishiGif) => {
        message.channel.send({
          files: [{
            attachment: `${oishiDir}/${oishiGif}`,
            name: `OISHIusagi.png`
          }]
        });
      });
    }
    */

    // juan
    if (messageContent.split(" ").includes('juan')) {
      console.log(`Command: Juan -- ${message.author.tag}`)
      message.channel.send({
        files: [{
          attachment: `${extrasPath}juan.gif`,
          name: `juanbby.gif`
        }]
      });
    }

  }
}