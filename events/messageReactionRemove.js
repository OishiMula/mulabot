// For reaction roles

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (reaction.message.id !== "1003868951681450115") return;

    if (reaction.emoji.name === "☀️") {
      console.log(user);
    }
  }
}