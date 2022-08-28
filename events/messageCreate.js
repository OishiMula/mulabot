const extrasPath = './extras/';
const config = require('../config/config');
const secrets = require('../config/secrets')
const randomFile = require('select-random-file');

// eslint-disable-next-line no-unused-vars
const Tenor = require("tenorjs").client({
  "Key": `${secrets.tenorToken}`, 
  "Filter": "off", 
  "Locale": "en_US",
  "MediaFilter": "gif",
  "DateFormat": "MM/D/YYYY - H:mm:ss A"
});

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
      if (message.author.id === config.twitterAltUserId) message.client.channels.cache.get(config.twitterAltChannel).send(`${config.newTweet} ${message.author.username}\n${message.content}`);
      else message.client.channels.cache.get(config.twitterChannel).send(`${config.newTweet} ${message.author.username}\n${message.content}`);
      config.twitterReacts.forEach(reaction => message.react(reaction));
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
    if (messageContent.split(" ").some(match => config.randomGifs.includes(match))) {
      const splitMessage = messageContent.split(" ");
      let matchMessage = splitMessage.filter(match => config.randomGifs.includes(match));

      for (let searchQuery in matchMessage) {
        // Quick fixes for certain terms
        switch (matchMessage[searchQuery]) {
          case 'ginger':
          case 'rip':
            matchMessage[searchQuery] = 'rip funny';
            break;
          case 'ups':
          case 'shillington':
            matchMessage[searchQuery] = 'ups delivery';
            break;
          case 'pasta':
          case 'linguini':
            matchMessage[searchQuery] = 'toby office';
            break;
          default:
            break;
        }

        Tenor.Search.Query(matchMessage[searchQuery], "50").then(results => {
          const randomGif = results[Math.floor(Math.random() * results.length)];
          message.channel.send(randomGif.url);
        })
      }
      console.log(`Command: ${matchMessage.toString()} -- ${message.author.tag}`)
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
  }
}