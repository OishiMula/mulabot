const extrasPath = './extras/';
const config = require('../config/config');
const secrets = require('../config/secrets')
const randomFile = require('select-random-file');

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

    // Linguini_ Kong Fud Filter
    /*if (message.author.id === '932913898473013268' && (messageContent.includes('kong') || messageContent.includes('kongs') || messageContent.includes('ongs') || messageContent.includes('ngs'))) {
      message.delete();
      message.channel.send('no no no - bad boy.');
      console.log(`Command: Delete Linguini_ Fud`)
    }*/

    // Twitter Function
    // This will retrieve messages that include a tweet link, add fun reacts, and repost it in a separate channel
    // There is an option for secondary post to go to a specific channel (ie, admin posting tweets)
    if (messageContent.includes('https://twitter.com') || messageContent.includes('https://www.twitter.com')) {
      if (message.author.id === config.twitterAltUserId) message.client.channels.cache.get(config.twitterAltChannel).send(`${config.newTweet} ${message.author.username}\n${message.content}`);
      else message.client.channels.cache.get(config.twitterChannel).send(`${config.newTweet} ${message.author.username}\n${message.content}`);
      config.twitterReacts.forEach(reaction => message.react(reaction)); 
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
          case 'bull':
          case 'bear':
            matchMessage[searchQuery] = 'crypto';
            break;
          case 'ginger':
          case 'gingers':
            matchMessage[searchQuery] = 'rip';
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

    /* REMOVE SOON:
    // Jimmy 
    if (message.content.toLowerCase().split(" ").includes('jimmy')) {
      console.log(`Command: Jimmy -- ${message.author.tag}`)
      const jimmyDir = `${extrasPath}/jimmy`
      randomFile(jimmyDir, (Err, jimmyGif) => {
        message.channel.send({
          files: [{
            attachment: `${jimmyDir}/${jimmyGif}`,
            name: `JIMMY.gif`
          }]
        });
      });
    }

    // Degen 
    if (message.content.toLowerCase().split(" ").includes('degen')) {
      console.log(`Command: Degen -- ${message.author.tag}`)
      const degenDir = `${extrasPath}/degen`
      randomFile(degenDir, (Err, degenGif) => {
        message.channel.send({
          files: [{
            attachment: `${degenDir}/${degenGif}`,
            name: `degenbois.gif`
          }]
        });
      });
    }

    // Cardano
    if (message.content.toLowerCase().split(" ").includes('cardano')) {
      console.log(`Command: Cardano -- ${message.author.tag}`)
      const cardanoDir = `${extrasPath}/cardano`
      randomFile(cardanoDir, (Err, cardanoGif) => {
        message.channel.send({
          files: [{
            attachment: `${cardanoDir}/${cardanoGif}`,
            name: `believeInCardano.gif`
          }]
        });
      });
    }

    // Crypto / Bear
    if (message.content.toLowerCase().split(" ").includes('bear') || message.content.toLowerCase().split(" ").includes('crypto')) {
      console.log(`Command: Crypto/Bear -- ${message.author.tag}`)
      const cryptoDir = `${extrasPath}/crypto`
      randomFile(cryptoDir, (Err, cryptoGif) => {
        message.channel.send({
          files: [{
            attachment: `${cryptoDir}/${cryptoGif}`,
            name: `WAGMIIII.gif`
          }]
        });
      });
    }

    // RIP
    if (message.content.toLowerCase().split(" ").includes('rip') ||
      message.content.toLowerCase().split(" ").includes('gingers') ||
      message.content.toLowerCase().split(" ").includes('ginger')) {
      console.log(`Command: Rip/Gingers -- ${message.author.tag}`)
      const ripDir = `${extrasPath}/rip`
      randomFile(ripDir, (Err, ripGif) => {
        message.channel.send({
          files: [{
            attachment: `${ripDir}/${ripGif}`,
            name: `ripMfer.gif`
          }]
        });
      });
    }

    // Solana Summer
    if (message.content.toLowerCase().split(" ").includes('solana')) {
      console.log(`Command: Solana -- ${message.author.tag}`)
      const solanaDir = `${extrasPath}/solana`
      randomFile(solanaDir, (Err, solanaGif) => {
        message.channel.send({
          files: [{
            attachment: `${solanaDir}/${solanaGif}`,
            name: `EWWsolanaWTF.gif`
          }]
        });
      });
    }

    // Shillington
    if (message.content.toLowerCase().split(" ").includes('shillington') || message.content.toLowerCase().split(" ").includes('ups')) {
      console.log(`Command: Shillington/UPS -- ${message.author.tag}`)
      const upsDir = `${extrasPath}/ups`
      randomFile(upsDir, (Err, upsGif) => {
        message.channel.send({
          files: [{
            attachment: `${upsDir}/${upsGif}`,
            name: `UPSManShillington.gif`
          }]
        });
      });
    }

    // here we go
    if (message.content.toLowerCase().includes("here we go")) {
      console.log(`Command: Here we go -- ${message.author.tag}`)
      const herewegoDir = `${extrasPath}/herewego`
      randomFile(herewegoDir, (Err, herewegoGif) => {
        message.channel.send({
          files: [{
            attachment: `${herewegoDir}/${herewegoGif}`,
            name: `hereweGO.gif`
          }]
        });
      });
    }

  */
  }
}