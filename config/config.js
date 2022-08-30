require('dotenv').config();
// Discord Channels
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
  'linguini',
  'rip',
  'ginger',
  'pasta',
  'shillington',
  'ups',
  'here we go',
  'feet'
]

// Twitter prefix message
const newTweet = '**NEW FIRE POSTED BY:**';

// Commands sent silently
const ephemeralCommands = [
	'shorts', 'wtf', 'mulamsg', 'admin', 'flex'
];

// Bot Icon URL
const botIcon = process.env.MULA_BOT_IMAGE;

const hypeMultipler = Math.round(Math.random() * (15 - 1 + 1) + 1)

module.exports = {
  twitterAltChannel,
  twitterAltUserId,
  twitterReacts,
  randomGifs,
  newTweet,
  ephemeralCommands,
  botIcon,
  hypeMultipler
};