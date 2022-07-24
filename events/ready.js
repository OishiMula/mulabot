const fs = require('node:fs');
const extrasPath = './extras/';
const mulaFN = require('../mula_functions');
const epochFile = './extras/epoch.txt'

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
      const epoch = await mulaFN.download(epochFile, 'local');
      const now = new Date().getTime();
      if (epoch.end > now) {
        console.log(`New Epoch -- Epoch ${epoch.current}`)
        const annoucementsChannel = client.channels.cache.get('941428920488718406');
        annoucementsChannel.send(`@everyone
        <a:sirenred:944494985288515644> **A NEW EPOCH HAS BEGUN!** <a:sirenred:944494985288515644>
        We are now on **Epoch ${epoch.current}** 
        Don't forget your Dripdropz at https://dripdropz.io/`);
        const newEpoch = await mulaFN.download('null', 'epoch');
        await writeFile(newEpoch, epochFile);
      }
    }, checkInterval);
  },
};