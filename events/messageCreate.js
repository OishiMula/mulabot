const extrasPath = '/home/pi/projects/js/mula_bot/extras/';
const randomFile = require('select-random-file');

module.exports = {
  name: 'messageCreate',
  execute(message)  {
    //if (message.content.toLowerCase() === 'test') console.log(message);

    if(message.author.bot) return;

    // Plxce Beats
    if (message.content.toLowerCase() === "drop the beat") {
      console.log(`Command: Drop the beat -- ${message.author.tag}`)
      message.channel.send({
        files: [{
          attachment: `${extrasPath}herewego.gif`,
          name: `hereweGO.gif`
        },
        {
          attachment: `${extrasPath}brunch_for_dinner.mp3`,
          name: `brunch_for_dinner.mp3`
        }]
      });
    }
  
    // Sheesh
    if (message.content.toLowerCase().split(" ").includes('sheesh')) {
      console.log(`Command: Sheesh -- ${message.author.tag}`)
      message.channel.send({
        files: [{
          attachment: `${extrasPath}sheesh.mp3`,
          name: `sheesh.mp3`
        }]
      });
    }
  
    // bitconnect
    if (message.content.toLowerCase().split(" ").includes('bitconnect')) {
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
    if (message.content.toLowerCase().includes('real kong shit')) {
      console.log(`Command: Real kong shit -- ${message.author.tag}`)
      message.channel.send({
        files: [{
          attachment: `${extrasPath}realkongshit.mp4`,
          name: `realkongshitbyplxce.mp4`
        }]
      });
    }
  
    // Puta
    if (message.content.toLowerCase().split(" ").includes('puta')) {
      console.log(`Command: Puta -- ${message.author.tag}`)
      message.channel.send({
        files: [{
          attachment: `${extrasPath}puta.gif`,
          name: `malditaPUTAcono.gif`
        }]
      });
    }
  
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
  
    // mini messi
    if (message.content.toLowerCase().split(" ").includes("mini messi") || message.content.toLowerCase().split(" ").includes('messi')) {
      console.log(`Command: Messi -- ${message.author.tag}`)
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
  }
}