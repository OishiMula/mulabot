// Add default roles to new members
module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    console.log(`New member joined: ${member}`);
  },
};
