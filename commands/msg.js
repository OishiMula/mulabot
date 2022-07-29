const {
	SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mulamsg')
		.setDescription('Yes master?')
		.addStringOption(option => option.setName('saying').setDescription('Whatcha want me to say?').setRequired(true)),
	async execute(interaction) {
		const message = interaction.options.getString('saying');
		if (interaction.user.id === '374929603594027018') {
			await interaction.editReply(`Sending message.`);
			interaction.channel.send(message);
		} 
		else if (interaction.user.id === '639648169663266839' && interaction.channel.id === '1002392255702765648') {
			await interaction.editReply(`Gotcha fams.`);
			interaction.channel.send(message);
		}
		else if (interaction.user.id === '927325301460045854' && interaction.channel.id === '1002428970161152071') {
			await interaction.editReply(`Gotcha fams.`);
			interaction.channel.send(message);
		}
			else await interaction.editReply(`You ain't oishi, shoo.`);
		return "Done";
	}
}