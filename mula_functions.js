const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const Fuse = require('fuse.js');
const axios = require('axios').default;
const axiosRetry = require('axios-retry');
const Blockfrost = require('@blockfrost/blockfrost-js');
const io = require('@pm2/io').init();
const chalk = require('chalk');
const pino = require('pino');
const dayjs = require('dayjs');
const { mulaCACHE, SQL } = require('./db');
const config = require('./config/config');
const api = require('./config/api');
const secrets = require('./config/secrets');

// eslint-disable-next-line import/order
const Tenor = require('tenorjs').client({
  Key: `${secrets.tenorToken}`,
  Filter: 'off',
  Locale: 'en_US',
  MediaFilter: 'gif',
  DateFormat: 'MM/D/YYYY - H:mm:ss A',
});

function timeNow() {
  return `${chalk.white(dayjs().format('MM/DD HH:mm:ss'))} `;
}

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      destination: '/home/nevets/logs/mulabot.log',
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    },
  },
});

const blockfrostAPI = new Blockfrost.BlockFrostAPI({ projectId: process.env.BLOCKFROST_TOKEN });
const interactionsCount = io.metric({ name: 'Interactions', id: 'actions', unit: 'exec' });
axiosRetry(axios, { retries: 3 });

const CREW = {
  oishi: ['Secretly Satoshi', 'Dirty $MILK whore', "I can't tell you, he's my boss", 'Charles asks him for CNFT recommendations'],
  plxce: ['whatever GC clays floor is', 'the one who started the cocoloco pump', 'Rank 1 of Chilled Kongs', '$MILK'],
  swaggins: ['MOON', 'dad?', 'the sad state of the vaping industry', 'he will take us to the moon'],
  banch: ['a few plantains', 'Spacebudz floor', 'definitely not a BCRC fan', 'The key to success for CNFTs is basing your decisions on whatever anyone with over 1k followers says. This is how you become rich.'],
  zeru: ['A week nonstop of giveaway winnings', 'ABHS in 2022', 'Handies floor', 'no really, this guy wins giveaways nonstop', 'the one who started the ada egg pump', 'THE SENSEI', '69 Million XMR'],
  jdavitt: ['rocket league diamond champ', 'the value of cardsafe(no, really)', 'who knows how nice his trading card stash truly is?', 'ADA Homes floor'],
  minshew: ['8008.135 ETH', '...buttheads floor, what else did you expect?', '/efloor buttheads', 'THIS GUY ONLY WHALES ON BUTTHEADS', 'buttheads w/ dudewipe combo'],
  anthony: ['2,500,000,000 ADA', '$14,000,000,000', '9,441 ETH', 'This guy is big money. No jokes.'],
  juan: ['69k ETH + a few little lemon friends', '<a:licktoes:944253276185043015>', 'ROBOROBO', 'He technically owns a Berry'],
  donvts: ["first ask, how old is plxce's mom?", 'this dude lives in Japan, BALLER', "wasn't his name donuts just a few days ago?", "ask Plxce's mom"],
  chisberg: ["I would write a bunch of things with proper linespaces\n\n but I'm a dumb bot", ':eyes:', ':eyes:\n\n:eyes:', 'homie is probably set, he good!'],
  carlucio: ['Cardano village floor', 'this dude whales in everything', "he's probably smarter than me"],
  jrod: ['halo kong floor', 'upcoming developer - aka he rich like my master', 'the chilliest degen of them all', '10,000,000,000 ADA'],
  'dad?': ["dad isn't coming home Timmy", 'Timmy, I told you, he is not coming home!', "TIMMY I CAN'T HANDLE YOU ASKING ANYMORE"],
  bruce: 'Fuck him',
  '0verdrip': ['MOONING :peach:', 'Drapes floor in 2024', 'always MOONING :peach:', ':peach:'],
  goofy: ['THIS MFER MINTED THULU, POUR ONE OUT', 'get the goofycrisp ADAHandle and sell it to him!'],
  doczero: ['-5 ADA, this mfer owes money to the blockchain!', "smooth yeti's floor", 'he lost a giveaway where he was the only one who entered', 'the price of a ~~moussaka~~ tzatziki dish'],
  floki: ['unicorn kong floor - THIS MFER BALLIN', 'degen toonz at the end of 2022', 'probably 2,000,000 ADA'],
  maid: ['gartic master', 'soft ass jelly mfer from RTC'],
  eligh: ['This mfer left us. :(', 'PR economy in 2029 after statehood', "Papi chulo - he's priceless"],
  sirshill: ['this mfer can actually keep plxce calm', 'GOLD GANG RTC FLOOR..in q3', 'if your package is late from UPS blame his ass', '1227 BTC'],
  bedo: ["don't underestimate - he's a whale", "photoshop guru - dude he's the artist we need", 'probably chills with Charles on a ranch irl', 'unv25 whale - enough said'],
  datass: ['yea i got a nice donk, mwahs', 'you wanna take a look?'],
};

const ERROR_SAYINGS = [
  'Typo maybe? Dum dum',
  'Common L for you',
  'Failing like Solana',
  'Try again I guess',
  'you fucking up',
  "shit's lost like Linguini",
  'sry come again',
  'nope no dice',
  'NOPE.',
  'so sorry oh well',
  "and i don't care",
  'ummmm, wat?',
  'anyway.. try again!',
];

async function jpgStoreCacheRefresh() {
  let jpgPolicyData = [];

  for (let num = 1; ; num++) {
    const jpgPage = `${api.jpgPolicy}${num}`;
    const jpgData = await axios.get(jpgPage);

    if (jpgData.data.length > 0) jpgPolicyData = [...jpgPolicyData, ...jpgData.data];
    else break;
  }
  await mulaCACHE.set('jpgstorecache', jpgPolicyData, 3600000);
}

async function download(data, type) {
  let response;

  try {
    switch (type) {
      case 'data':
        response = await axios.get(data);
        if (!response.statusText === 'OK') {
          console.error('ERROR: Response not OK || Data download');
          return 'error';
        }
        return response.data;

      case 'thumbnail': {
        response = await axios.get(data);
        if (typeof (response.data.thumbnail) !== 'string') return api.jpgStoreLogo;
        return response.data.thumbnail.slice(7);
      }

      case 'project': {
        // Set up Fuse options to typos/fuzzy search
        const options = {
          keys: ['url', 'display_name', 'policy_id'],
          threshold: 0.5,
          distance: 0,
          includeScore: true,
        };

        const exactOptions = {
          keys: ['url', 'display_name', 'policy_id'],
          useExtendedSearch: true,
          includeScore: true,
        };

        // retrieve jpgStore cache
        if (!await mulaCACHE.get('jpgstorecache')) await jpgStoreCacheRefresh();
        const jpgStoreCache = await mulaCACHE.get('jpgstorecache');

        // set up fuzzy searches for typos
        const fuse = new Fuse(jpgStoreCache, options);
        const exactFuse = new Fuse(jpgStoreCache, exactOptions);

        // check to see if there is an exact match, return immediately
        const match = exactFuse.search(`=${data}`);
        if (match.length > 0) return match[0].item;

        const fuzzymatch = fuse.search(data);
        return (fuzzymatch[0].item);
      }

      case 'epoch': {
        const latestEpoch = await blockfrostAPI.epochsLatest();
        const epoch = {
          current: latestEpoch.epoch,
          end: latestEpoch.end_time,
        };
        return epoch;
      }

      case 'local': {
        response = fs.readFileSync(data, 'utf8');
        const fileData = JSON.parse(response);
        return fileData;
      }

      default:
        console.error('ERROR: download');
        return 'error';
    }
  } catch (error) {
    console.error(`${error}\nPayload: ${data}`);
    return 'error';
  }
}

async function createMsg(payload, messages) {
  const author = { name: 'Mula Bot - The Degen\'s Servant', iconURL: config.botIcon };

  let footer;
  switch (payload.source) {
    case 'jpg': {
      footer = { text: 'Data provided by jpg.store' };
      break;
    }
    case 'opencnft': {
      footer = { text: 'Data provided by opencnft.io' };
      break;
    }
    case 'coingecko': {
      footer = { text: 'Data provided by coingecko.com' };
      break;
    }
    case 'opensea': {
      footer = { text: 'Data provided by opensea.io' };
      break;
    }
    default:
      footer = { text: 'Data provided by ME' };
      break;
  }

  const color = '#F70000';
  const newMessage = new EmbedBuilder()
    .setTitle(payload.title)
    .setThumbnail(payload.thumbnail)
    .setColor(color)
    .setAuthor(author)
    .setFooter(footer);

  if (messages) for (const message of messages) newMessage.addFields(message);
  else newMessage.addFields({ name: payload.header, value: payload.content });
  return newMessage;
}

async function shortcutCheck(project) {
  const shortcutExist = await SQL('shorts').where({ short: project }).first();
  if (shortcutExist) return shortcutExist.full;
  return project;
}

function crewCheck(homie) {
  if (homie in CREW) return true;
  return false;
}

function choose(choices) {
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

async function incInteractions(interaction) {
  if (interaction !== 1) await SQL('guilds').where({ guildid: interaction.guildId }).increment('interactions', 1);
  const interactionsAmount = await SQL('guilds').select('interactions');
  const totalInteractions = interactionsAmount.reduce((tot, amt) => tot + amt.interactions, 0);
  interactionsCount.set(totalInteractions);
}

function sleep(ms) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms || 1000));
}

module.exports = {
  CREW,
  ERROR_SAYINGS,
  download,
  createMsg,
  jpgStoreCacheRefresh,
  shortcutCheck,
  crewCheck,
  choose,
  incInteractions,
  sleep,
  Tenor,
  timeNow,
  logger,
};
