/* eslint-disable no-unused-vars */
const fs = require('node:fs');
const mulaFN = require('../mula_functions');
const config = require('../config/config');
const secrets = require('../config/secrets');
const cron = require('node-cron');
const Keyv = require('keyv');
const keyv = new Keyv('redis://localhost:6379/0');
keyv.on('error', err => console.error('ERROR: Keyv connection error:', err));
const { ReactionRole } = require("discordjs-reaction-role");
const commontags = require('common-tags');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log("Mula Bot Starting ...");

    // Reaction Roles
    async function updateReactRoles() {
      let channelData = await client.channels.cache.find(channelList => channelList.id === '941434790861754439')
      let editMsg = await channelData.messages.fetch('1004974668912009327');
      // cant retrieve the object to use as normal
      //let editMsg = await keyv.get('rolesmsg');

      let emojiRoles = ['🌞', '🐇', '⚔️', '🐱', '🦉', '👻', '🍪', '🦩', '🦆', '📘'];
      const newMsg = commontags.stripIndents `Holder Roles - React to Add/Remove
        Melting Moonboy - 🌞 
        DRRS - 🐇 
        Tavern Squad - ⚔️ 
        Gutter Clone - 🐱 
        Blockowls - 🦉 
        Clumsy Ghosts - 👻 
        Gingerbread Squad - 🍪
        The JRney - 🦩
        The Mallard Order - 🦆
        Introverts - 📘`;

      editMsg.edit(newMsg);

      /* Following lines Create a new message */
      //const roleChannel = client.channels.cache.get('941434790861754439');
      //const reactMsg = await roleChannel.send(newMsg);
      //console.log('INFO: Reaction Roles: New Message Created')

      /* Following lines update an existing message */
      for (let emoji in emojiRoles) editMsg.react(emojiRoles[emoji]);
      console.log('INFO: Reaction Roles: Update Complete')

      await keyv.set('rolesmsg', editMsg);
    }

    // Turn on the following line to update Reaction Roles
    //updateReactRoles();

    // Retrieve ReactionMessage
    let reactMsg = '1004974668912009327';
    
    const rrConfig = [
      { messageId: reactMsg, reaction: "🌞", roleId: "986823055756111963" },
      { messageId: reactMsg, reaction: "🐇", roleId: "984073693770707025" },
      { messageId: reactMsg, reaction: "⚔️", roleId: "984073414270656523" },
      { messageId: reactMsg, reaction: "🐱", roleId: "960438256535752755" },
      { messageId: reactMsg, reaction: "🦉", roleId: "1001688915863937114" },
      { messageId: reactMsg, reaction: "👻", roleId: "991135538876776518" },
      { messageId: reactMsg, reaction: "🍪", roleId: "978825307136081951" },
      { messageId: reactMsg, reaction: "🦩", roleId: "1004990285773799436" },
      { messageId: reactMsg, reaction: "🦆", roleId: "1005090798238437446" },
      { messageId: reactMsg, reaction: "📘", roleId: "1005330874516123649" },
    ]

    const reactionRoles = new ReactionRole(client, rrConfig);

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