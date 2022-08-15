// Add default roles to new members

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    console.log(`New member joined: ${member}`)
    
    // For bots, add bot category & useful bot
    if (member.user.bot) {
      member.roles.add('1008041987271839744');
      member.roles.add('951552356535906415');
      return;
    }

    // For members, add titles category & degen role
    member.roles.add('1008038718990467112');
    member.roles.add('941432444580683797');
    member.roles.add('1008033893963800659');
    return;
  }
}