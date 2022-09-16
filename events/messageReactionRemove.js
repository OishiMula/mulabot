// For reaction roles

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (reaction.message.id !== '1004974668912009327') return;

    switch (reaction.emoji.name) {
      case '🌞':
        console.log(`Reaction Roles removed: 🌞 - ${user.tag}`);
        break;
      case '🐇':
        console.log(`Reaction Roles removed: 🐇 - ${user.tag}`);
        break;
      case '⚔️':
        console.log(`Reaction Roles removed: ⚔️ - ${user.tag}`);
        break;
      case '🐱':
        console.log(`Reaction Roles removed: 🐱 - ${user.tag}`);
        break;
      case '🦉':
        console.log(`Reaction Roles removed: 🦉 - ${user.tag}`);
        break;
      case '👻':
        console.log(`Reaction Roles removed: 👻 - ${user.tag}`);
        break;
      case '🍪':
        console.log(`Reaction Roles removed: 🍪 - ${user.tag}`);
        break;
      case '🦩':
        console.log(`Reaction Roles removed: 🦩 - ${user.tag}`);
        break;
      case '🦆':
        console.log(`Reaction Roles removed: 🦆 - ${user.tag}`);
        break;
      case '📘':
        console.log(`Reaction Roles removed: 📘 - ${user.tag}`);
        break;
      default:
        break;
    }
  },
};
