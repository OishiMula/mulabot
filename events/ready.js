/* eslint-disable no-unused-vars */
const fs = require('node:fs');
const mulaFN = require('../mula_functions');
const config = require('../config/config');
const cron = require('node-cron');
const Keyv = require('keyv');
const keyv = new Keyv('redis://localhost:6379/0');
keyv.on('error', err => console.error('ERROR: Keyv connection error:', err));
const { ReactionRole } = require("discordjs-reaction-role");

module.exports = {
  name: 'ready',
  once: true,
  async execute (client) {
    console.log("Mula Bot Starting ...");

    // ReactionsRole Code
    // This following code creates a new ReactionRole message
   /* const newMsg = `Holder Roles - React to Add/Remove
Melting Moonboy - 🌞 
DRRS - 🐇 
Tavern Squad - ⚔️ 
Gutter Clone - 🐱 
Blockowls - 🦉 
Clumsy Ghosts - 👻 
Gingerbread Squad - 🍪`;
  let emojiRoles = ['🌞', '🐇', '⚔️', '🐱', '🦉', '👻', '🍪'];

    const roleChannel = client.channels.cache.get('941434790861754439');
    const reactMsg = await roleChannel.send(newMsg);
    for (let emoji in emojiRoles) reactMsg.react(emojiRoles[emoji]);
    console.log(reactMsg.id);
    await keyv.set('rolesmsg', reactMsg);
*/

    const reactMsg = '1004974668912009327';
    const reactionRoles = new ReactionRole(client, [
      { messageId: reactMsg, reaction: "🌞", roleId: "986823055756111963" },
      { messageId: reactMsg, reaction: "🐇", roleId: "984073693770707025" },
      { messageId: reactMsg, reaction: "⚔️", roleId: "984073414270656523" },
      { messageId: reactMsg, reaction: "🐱", roleId: "960438256535752755" },
      { messageId: reactMsg, reaction: "🦉", roleId: "1001688915863937114" },
      { messageId: reactMsg, reaction: "👻", roleId: "991135538876776518" },
      { messageId: reactMsg, reaction: "🍪", roleId: "978825307136081951" },
    ]);
    
    // * Epoch Countdown *
    // Check to see if epoch data exist
    if (!await keyv.get('epoch')) {
      console.error("No Epoch data found - Downloading.");
      await keyv.set('epoch', await mulaFN.download('null', 'epoch'));
      console.log(await keyv.get('epoch'));
    }

    // Scheduled task to check epoch - Main Logic
    cron.schedule('* */30 * * * *', async () => {
        let epoch = await keyv.get('epoch');
        let now = new Date().getTime();

        // To even out numbers for comparison, date compare didn't work
        let epochCompare = String(epoch.end).padEnd(15, '0');
        let nowCompare = String(now).padEnd(15, '0');

        if (Number(nowCompare) > Number(epochCompare)) {
          let epochNew = await mulaFN.download('null', 'epoch');
          // Sometimes Blockfrost takes a bit to update.
          if (epoch.current === epochNew.current) {
            console.log('same- done.')
            return;
          }
          await keyv.set('epoch', epochNew);
          const annoucement = client.channels.cache.get(config.annoucementChannel);
          await annoucement.send(`@everyone
<a:sirenred:944494985288515644> **A NEW EPOCH HAS BEGUN!** <a:sirenred:944494985288515644>
We are now on **Epoch ${epochNew.current}** 
Don't forget your Dripdropz at https://dripdropz.io/`);
        }
    })
  }
};
