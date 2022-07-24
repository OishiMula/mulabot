const {
	SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('msg')
		.setDescription('Yes master?')
		.addStringOption(option => option.setName('saying').setDescription('Whatcha want me to say?').setRequired(true)),
	async execute(interaction) {
		const message = interaction.options.getString('saying');
		if (interaction.user.id === '374929603594027018') {
			await interaction.editReply(`Sending message.`);
			interaction.channel.send(message);
		} else await interaction.editReply(`You ain't oishi, shoo.`);
		return "Done";
	}
}