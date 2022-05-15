const fetch = require('cross-fetch');
const { MessageEmbed } = require('discord.js');

// API Endpoints
const jpgPolicyLookupAPI = 'https://server.jpgstoreapis.com/search/collections?verified=should-be-verified&nameQuery=';
const jpgCollectionAPI = 'https://server.jpgstoreapis.com/collection/';
const jpgPolicyAPI = 'https://server.jpgstoreapis.com/policy/';
const jpgStoreLink = 'https://www.jpg.store/collection/';
const opencnftPolicyAPI = 'https://api.opencnft.io/1/policy/';
const ipfsBase = 'https://infura-ipfs.io/ipfs/';

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
  "bcrc": "boss cat rocket club",
  "brightleaf": "brightleaf laboratories",
  "carda": "carda station land",
  "ck": "chilled kongs",
  "clays": "clay nation",
  "clumsy": "clumsy ghosts",
  "corn": "cornucopias bubblejett sprinter 2022",
  "cwar": "cardano warriors",
  "dcc": "degen crypto club",
  "drrs": "dead rabbit resurrection society",
  "drapes": "derp apes",
  "gcclays": "clay nation x good charlotte",
  "havoc": "havoc worlds",
  "hw": "havoc worlds",
  "knfty": "knfty world knfty creatures",
  "mdcc" : "mad dog car club",
  "mek" : "Mekanism",
  "pom": "petbot",
  "pxlz": "deadpxlz",
  "soho": "soho kids",
  "ue": "unbounde dearth",
  "unsigs": "unsigned_algorithms",
  "ubuc" : "ugly boys x ugly community",
  "yetis": "smooth yeti mountain club",
}

module.exports = {
  jpgPolicyLookupAPI,
  jpgCollectionAPI,
  jpgPolicyAPI,
  jpgStoreLink,
  opencnftPolicyAPI,
  ipfsBase,
  CREW,
  SHORTCUTS
}

module.exports.download = async function(url, type) {
  let count = 1;
    for (;;) {
      try {
        const response = await fetch(url);
        switch (type) {
          case 'data':
            return await response.json();
          case 'thumbnail': {
            const imgJ = await response.json();
            return imgJ.thumbnail.slice(7);
          }
          case 'project': {
            const respJ = await response.json();
            const project = {
              name : respJ['collections'][0]['url'],
              properName : respJ['collections'][0]['display_name'],
              policyID : respJ['collections'][0]['policy_id']
            };
            return project;
          }
          default:
            return console.error('Error with download!');
        }
      } catch (error) {
        count += 1;
        count <= 5 ? console.error(`Error: ${error} -- Retrying`) : false; 
      }
    }
}

module.exports.createMsg = async function(payload) {
  const author = {
    name: 'Mula Bot - Degens Den Servant',
    iconURL: 'https://bafybeidb6f5rr27no5ghctfbac4zktulwa4ku6rfhuardx3iwu7cvocl4q.ipfs.infura-ipfs.io/'
  }
  let footer;
  switch (payload.mp) {
    case 'jpg': {
      footer = { text: 'Data provided by jpg.store' };
      break;
    }
    default:
      footer = { text: 'Data provided by ME' };
      break;
  }

  const color = '#F70000'

  const newMessage = await new MessageEmbed()
    .setTitle(payload.title)
    .setThumbnail(payload.thumbnail)
    .setColor(color)
    .setAuthor(author)
    .setFooter(footer)
    .addField(payload.projectName, payload.content);

  return newMessage;
}

module.exports.choose = function(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}