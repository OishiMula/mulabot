/* eslint-disable no-unused-vars */
const fs = require('node:fs');
const mulaFN = require('../mula_functions');
const config = require('../config/config');
const cron = require('node-cron');
const Keyv = require('keyv');
const keyv = new Keyv('redis://localhost:6379/0');
keyv.on('error', err => console.error('ERROR: Keyv connection error:', err));
let epochData;


module.exports = {
  name: 'ready',
  once: true,
  async execute (client) {
    console.log("Mula Bot Starting ...");

    // * Epoch Countdown *
    // Check to see if epoch data exist
    if (!await keyv.get('epoch')) {
      console.error("No Epoch data found - Downloading.");
      await keyv.set('epoch', await mulaFN.download('null', 'epoch'));
      console.log(await keyv.get('epoch'));
    }

    // Scheduled task to check epoch - Main Logic
    cron.schedule('* */15 * * * *', async () => {
        let epoch = await keyv.get('epoch');
        let now = new Date().getTime();

        // To even out numbers for comparison, date compare didn't work
        let epochCompare = String(epoch.end).padEnd(15, '0');
        let nowCompare = String(now).padEnd(15, '0');

        if (Number(nowCompare) > Number(epochCompare)) {
          let epochNew = await mulaFN.download('null', 'epoch');
          await keyv.set('epoch', epochNew);
          const annoucement = client.channels.cache.get(config.annoucementChannel);
          console.log(`Info: New Epoch -- Epoch ${epochNew.current}`);
          await annoucement.send(`everyone
<a:sirenred:944494985288515644> **A NEW EPOCH HAS BEGUN!** <a:sirenred:944494985288515644>
We are now on **Epoch ${epochNew.current}** 
Don't forget your Dripdropz at https://dripdropz.io/`);
        }
    })
  }
};
