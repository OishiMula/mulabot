require('dotenv').config();
// Bot owner Discord Id
const ownerId = '374929603594027018';

// Discord Channels
const annoucementChannel = '941428920488718406';
const twitterChannel = '944095401194172427';
const twitterAltChannel = '941847130983759872';
const twitterAltUserId = '503807404648038410';

// Twitter alarm reactions
const twitterReacts = [
  'a:sirenred:944494985288515644', 
  'a:sirenblue:944494579409883157', 
  'a:sirengreen:944494579770593290', 
  'a:sirenpurple:944494579544117279', 
  'a:sirenred2:944494548325912617'
];

// Gif Trigger Words
const randomGifs = [
  'jimmy',
  'degen',
  'cardano',
  'crypto',
  'bear',
  'bull',
  'rip',
  'ginger',
  'gingers',
  'solana',
  'shillington',
  'ups',
  'here we go',
  'messi'
]

// Twitter prefix message
const newTweet = '**NEW FIRE POSTED BY:**';

// Commands sent silently
const ephemeralCommands = [
	'shorts', 'wtf', 'mulamsg'
];

// Bot Icon URL
const botIcon = process.env.MULA_BOT_IMAGE;

module.exports = {
  ownerId,
  annoucementChannel,
  twitterChannel,
  twitterAltChannel,
  twitterAltUserId,
  twitterReacts,
  randomGifs,
  newTweet,
  ephemeralCommands,
  botIcon,
};