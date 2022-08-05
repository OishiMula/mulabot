// For reaction roles

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (reaction.message.id !== "1004974668912009327") return;

    switch (reaction.emoji.name) {
      case '🌞':
        console.log(`Reaction Roles added: 🌞 - ${user.tag}`);
        break;
      case '🐇':
        console.log(`Reaction Roles added: 🐇 - ${user.tag}`);
        break;
      case '⚔️':
        console.log(`Reaction Roles added: ⚔️ - ${user.tag}`);
        break;
      case '🐱':
        console.log(`Reaction Roles added: 🐱 - ${user.tag}`);
        break;
      case '🦉':
        console.log(`Reaction Roles added: 🦉 - ${user.tag}`);
        break;
      case '👻':
        console.log(`Reaction Roles added: 👻 - ${user.tag}`);
        break;
      case '🍪':
        console.log(`Reaction Roles added: 🍪 - ${user.tag}`);
        break;
    }
  }
}