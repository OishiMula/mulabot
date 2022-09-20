const { ReactionRole } = require('discordjs-reaction-role');
const cron = require('node-cron');
const ct = require('common-tags');
const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
const {
  download, incInteractions, timeNow, logger,
} = require('../mula_functions');
const { mulaCACHE, SQL } = require('../db');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(timeNow() + chalk.cyan('Mula Bot Starting ...'));
    incInteractions(1);

    // Reaction Roles
    // eslint-disable-next-line no-unused-vars
    async function updateReactRoles() {
      const channelData = await client.channels.cache.find((channelList) => channelList.id === '941434790861754439');
      const editMsg = await channelData.messages.fetch('1004974668912009327');
      // cant retrieve the object to use as normal
      // let editMsg = await mulaRDB.get('rolesmsg');

      const emojiRoles = ['🌞', '🐇', '⚔️', '🐱', '🦉', '👻', '🍪', '🦩', '🦆', '📘'];
      const newMsg = ct.stripIndents`Holder Roles - React to Add/Remove
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
      // const roleChannel = client.channels.cache.get('941434790861754439');
      // const reactMsg = await roleChannel.send(newMsg);
      // console.log('INFO: Reaction Roles: New Message Created')

      /* Following lines update an existing message */
      for (const emoji of emojiRoles) editMsg.react(emoji);
      console.log('info: Reaction Roles: Update Complete');

      await mulaCACHE.set('rolesmsg', editMsg);
    }

    // Turn on the following line to update Reaction Roles
    // updateReactRoles();

    // Retrieve ReactionMessage
    const reactMsg = '1004974668912009327';
    const rrConfig = [
      { messageId: reactMsg, reaction: '🌞', roleId: '986823055756111963' },
      { messageId: reactMsg, reaction: '🐇', roleId: '984073693770707025' },
      { messageId: reactMsg, reaction: '⚔️', roleId: '984073414270656523' },
      { messageId: reactMsg, reaction: '🐱', roleId: '960438256535752755' },
      { messageId: reactMsg, reaction: '🦉', roleId: '1001688915863937114' },
      { messageId: reactMsg, reaction: '👻', roleId: '991135538876776518' },
      { messageId: reactMsg, reaction: '🍪', roleId: '978825307136081951' },
      { messageId: reactMsg, reaction: '🦩', roleId: '1004990285773799436' },
      { messageId: reactMsg, reaction: '🦆', roleId: '1005090798238437446' },
      { messageId: reactMsg, reaction: '📘', roleId: '1005330874516123649' },
    ];

    // eslint-disable-next-line no-unused-vars
    const reactionRoles = new ReactionRole(client, rrConfig);

    // * Epoch Countdown *
    // Check to see if epoch data exist
    if (!await mulaCACHE.get('epoch')) {
      const logMessage = chalk.red('ERROR: no epoch data');
      console.error(timeNow() + logMessage);
      logger.error(stripAnsi(logMessage));
      await mulaCACHE.set('epoch', await download('null', 'epoch'));
      console.log(await mulaCACHE.get('epoch'));
    }

    // Scheduled task to check epoch - Main Logic
    cron.schedule('* */30 * * * *', async () => {
      const epoch = await mulaCACHE.get('epoch');
      const now = new Date().getTime();

      // To even out numbers for comparison, date compare didn't work
      const epochCompare = String(epoch.end).padEnd(15, '0');
      const nowCompare = String(now).padEnd(15, '0');

      if (Number(nowCompare) > Number(epochCompare)) {
        const epochNew = await download('null', 'epoch');
        // Sometimes Blockfrost takes a bit to update.
        if (epoch.current === epochNew.current) return;
        await mulaCACHE.set('epoch', epochNew);
        const announcementChannels = await SQL('configs').select('announcementchannel');

        for (const chan of announcementChannels) {
          const discordChannel = client.channels.cache.get(chan.announcementchannel);
          await discordChannel.send(ct.stripIndents`@everyone
          <a:sirenred:944494985288515644> **A NEW EPOCH HAS BEGUN!** <a:sirenred:944494985288515644>
          We are now on **Epoch ${epochNew.current}** 
          Don't forget your [Dripdropz](https://dripdropz.io) or [TosiDrop](https://tosidrop.io/)`);
        }

        const logMessage = chalk.green(`${chalk.yellow('new epoch')} - ${epochNew.current}`);
        console.error(timeNow() + logMessage);
        logger.error(stripAnsi(logMessage));
      }
    });
  },
};
