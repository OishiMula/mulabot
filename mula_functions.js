const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const Blockfrost = require('@blockfrost/blockfrost-js');
const Fuse = require('fuse.js');
const secrets = require('./config/secrets');
const api = require('./config/api');
const config = require('./config/config');
const axios = require('axios').default;
const Keyv = require('keyv');
const keyv = new Keyv('redis://localhost:6379/0');
keyv.on('error', err => console.error('ERROR: Keyv connection error:', err));

const blockfrostAPI = new Blockfrost.BlockFrostAPI({
  projectId: secrets.blockfrostToken
});

const CREW = {
  "oishi": ["Secretly Satoshi", "Dirty $MILK whore", "I can't tell you, he's my boss", "Charles asks him for CNFT recommendations"],
  "plxce": ["whatever GC clays floor is", "the one who started the cocoloco pump", "Rank 1 of Chilled Kongs", "$MILK"],
  "swaggins": ["MOON", "dad?", "the sad state of the vaping industry", "he will take us to the moon"],
  "banch": ["a few plantains", "Spacebudz floor", "definitely not a BCRC fan", "The key to success for CNFTs is basing your decisions on whatever anyone with over 1k followers says. This is how you become rich."],
  "zeru": ["A week nonstop of giveaway winnings", "ABHS in 2022", "Handies floor", "no really, this guy wins giveaways nonstop", "the one who started the ada egg pump", "THE SENSEI", "69 Million XMR"],
  "jdavitt": ["rocket league diamond champ", "the value of cardsafe(no, really)", "who knows how nice his trading card stash truly is?", "ADA Homes floor"],
  "minshew": ["8008.135 ETH", "...buttheads floor, what else did you expect?", "/efloor buttheads", "THIS GUY ONLY WHALES ON BUTTHEADS", "buttheads w/ dudewipe combo"],
  "anthony": ["2,500,000,000 ADA", "$14,000,000,000", "9,441 ETH", "This guy is big money. No jokes."],
  "juan": ["69k ETH + a few little lemon friends", "<a:licktoes:944253276185043015>", "ROBOROBO", "He technically owns a Berry"],
  "donvts": ["first ask, how old is plxce's mom?", "this dude lives in Japan, BALLER", "wasn't his name donuts just a few days ago?", "ask Plxce's mom"],
  "chisberg": ["I would write a bunch of things with proper linespaces\n\n but I'm a dumb bot", ":eyes:", ":eyes:\n\n:eyes:", "homie is probably set, he good!"],
  "carlucio": ["Cardano village floor", "this dude whales in everything", "he's probably smarter than me"],
  "jrod": ["halo kong floor", "upcoming developer - aka he rich like my master", "the chilliest degen of them all", "10,000,000,000 ADA"],
  "dad?": ["dad isn't coming home Timmy", "Timmy, I told you, he is not coming home!", "TIMMY I CAN'T HANDLE YOU ASKING ANYMORE"],
  "bruce": "Fuck him",
  "0verdrip": ["MOONING :peach:", "Drapes floor in 2024", "always MOONING :peach:", ":peach:"],
  "goofy": ["THIS MFER MINTED THULU, POUR ONE OUT", "get the goofycrisp ADAHandle and sell it to him!"],
  "doczero": ["-5 ADA, this mfer owes money to the blockchain!", "smooth yeti's floor", "he lost a giveaway where he was the only one who entered", "the price of a ~~moussaka~~ tzatziki dish"],
  "floki": ["unicorn kong floor - THIS MFER BALLIN", "degen toonz at the end of 2022", "probably 2,000,000 ADA"],
  "maid": ["gartic master", "soft ass jelly mfer from RTC"],
  "eligh": ["This mfer left us. :(", "PR economy in 2029 after statehood", "Papi chulo - he's priceless"],
  "sirshill": ["this mfer can actually keep plxce calm", "GOLD GANG RTC FLOOR..in q3", "if your package is late from UPS blame his ass", "1227 BTC"],
  "bedo": ["don't underestimate - he's a whale", "photoshop guru - dude he's the artist we need", "probably chills with Charles on a ranch irl", "unv25 whale - enough said"],
  "datass": ["yea i got a nice donk, mwahs", "you wanna take a look?"]
}

const SHORTCUTS = {
  "arc": "apeing riot club",
  "bad fox": "badfoxmotorcycleclub-foxcollection",
  "bc": "beyond citizens",
  "bcrc": "bosscatrocketclub",
  "carda": "cardastationland",
  "ck": "chilledkongs",
  "clay": "clay nation",
  "clumsy": "clumsyghosts",
  "cornbubble": "cornucopias-bubblejett-sprinter2022",
  "cornjave": "cornucopiasgtijavelin2022",
  "cwar": "cardano warriors",
  "dcc": "degencryptoclub",
  "drrs": "deadrabbitresurrectionsociety",
  "drapes": "derpapes",
  "gcclays": "clay nation x good charlotte",
  "havoc": "havocworlds",
  "hoppers": "happy hoppers club",
  "htc": "happytigersclub",
  "hw": "havoc worlds",
  "knfty": "knftyworldknftycreatures",
  "mmb": "meltingmoonboy",
  "mdcc": "maddogcarclub",
  "mek": "mekanism",
  "pxlz": "deadpxlz",
  "sac": "spaceapeclub",
  "soho": "soho kids",
  "unsigs": "unsigned_algorithms",
  "vox kongs": "boss planet vox kongs",
  "tangz": "wild tangz",
  "yetis": "smooth yeti mountain club",
}

const SHORTCUTS_ETH = {
  "bayc": "boredapeyachtclub",
  "buttheads": "buttheads-real",
  "degentoonz": "degentoonz-collection",
  "lemons": "little-lemon-friends",
  "soulz": "soulz-monogatari7777",
}

const ERROR_SAYINGS = [
  "Typo maybe? Dum dum",
  "Common L for you",
  "Failing like Solana",
  "Try again I guess",
  "you fucking up",
  "shit's lost like Linguini",
  "sry come again",
  "nope no dice",
  "nah but in other news, Oishi is dope.",
  "NOPE.",
  "so sorry oh well",
  "and i don't care",
  "ummmm, wat?",
  "anyway.. try again!",
]

async function download (data, type) {
  let response;

  try {
    switch (type) {
      case 'data':
        response = await axios.get(data);
        if (!response.statusText === 'OK') {
          console.error(`ERROR: Response not OK || Data download`)
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
        }
        
        // variables to begin the jpg store search
        let match, fuzzymatch, fuse, exactFuse;
        
        // retrieve jpgStore cache
        if (!await keyv.get('jpgstorecache')) await jpgStoreCacheRefresh();
        const jpgStoreCache = await keyv.get('jpgstorecache');

        // set up fuzzy searches for typos
        fuse = new Fuse(jpgStoreCache, options);
        exactFuse = new Fuse(jpgStoreCache, exactOptions);

        // check to see if there is an exact match, return immediately
        match = exactFuse.search(`=${data}`);
        if (match.length > 0) return match[0].item

        fuzzymatch = fuse.search(data);
        return (fuzzymatch[0].item);
      }

      case 'epoch': {
        const latestEpoch = await blockfrostAPI.epochsLatest();
        const epoch = {
          current: latestEpoch.epoch,
          end: latestEpoch.end_time
        }
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
  } catch(error) {
    console.error(`${error}\nPayload: ${data}`)
    return 'error';
  }
}

async function createMsg (payload) {
  const author = {
    name: 'Mula Bot - Degens Den Servant',
    iconURL: config.botIcon
  }

  let footer;
  switch (payload.source) {
    case 'jpg': {
      footer = {
        text: 'Data provided by jpg.store'
      };
      break;
    }
    case 'opencnft': {
      footer = {
        text: 'Data provided by opencnft.io'
      };
      break;
    }
    case 'opensea': {
      footer = {
        text: 'Data provided by opensea.io'
      };
      break;
    }
    case 'museliswap': {
      footer = {
        text: 'Data provided by museliswap.com'
      };
      break;
    }
    default:
      footer = {
        text: 'Data provided by ME'
      };
      break;
  }

  const color = '#F70000'

  const newMessage = new EmbedBuilder()
    .setTitle(payload.title)
    .setThumbnail(payload.thumbnail)
    .setColor(color)
    .setAuthor(author)
    .setFooter(footer)
    .addFields({ name: payload.header, value: payload.content });

  return newMessage;
}

async function jpgStoreCacheRefresh() {
  let jpgPolicyData = [];
        
  for (let num = 1; ; num++) {
    let jpgPage = `${api.jpgPolicy}${num}`;
    let jpgData = await axios.get(jpgPage);
  
    if (jpgData.data.length > 0) jpgPolicyData = [...jpgPolicyData, ...jpgData.data];
    else break;
  }
  await keyv.set('jpgstorecache', jpgPolicyData, 3600000);
}

function shortcutCheck (project) {
  if (project in SHORTCUTS) return SHORTCUTS[project];
  else return project;
}

function crewCheck (homie) {
  if (homie in CREW) return true;
}

function choose (choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

const DEF_DELAY = 1000;
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

module.exports = {
  CREW,
  SHORTCUTS,
  SHORTCUTS_ETH,
  ERROR_SAYINGS,
  download,
  createMsg,
  jpgStoreCacheRefresh,
  shortcutCheck,
  crewCheck,
  choose,
  sleep
}