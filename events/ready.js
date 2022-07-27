require('dotenv').config();
const fs = require('node:fs');
const extrasPath = './extras/';
const mulaFN = require('../mula_functions');
const epochFile = './extras/epoch.txt'

//let epoch, newEpoch, now, annoucementsChannel;

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log("Mula Bot Starting");

    async function writeFile(data, file) {
      fs.writeFileSync(file, JSON.stringify(data), (err) => {
        if (err) console.log(err);
      });
    }


    // Epoch Countdown loop
    const checkMinutes = 0.1,
      checkInterval = checkMinutes * 60 * 1000;
    setInterval(async () => {
      // File check
      if (!fs.existsSync(`${extrasPath}epoch.txt`)) {
        console.error("Error with Epoch file");
        const firstTimeEpoch = await mulaFN.download('null', 'epoch');
        await writeFile(firstTimeEpoch, epochFile);
      }

      // Check epoch end's time and compare
      //epoch = await mulaFN.download(epochFile, 'local');
      //now = new Date().getTime();
      //console.log(`now: ${now} --- epoch: ${epoch.end}`);
      // TODO: Webhook fix?
      /*if (epoch.end < now) {
        newEpoch = await mulaFN.download('null', 'epoch');
        await writeFile(newEpoch, epochFile);
        annoucementsChannel = client.channels.cache.get(process.env.DD_ANNOUCE_CHANNEL);
        console.log(`New Epoch -- Epoch ${newEpoch.current}`)
        annoucementsChannel.send(`test put the everyone thing
<a:sirenred:944494985288515644> **A NEW EPOCH HAS BEGUN!** <a:sirenred:944494985288515644>
We are now on **Epoch ${newEpoch.current}** 
Don't forget your Dripdropz at https://dripdropz.io/`);
      }*/
    }, checkInterval);
  },
};