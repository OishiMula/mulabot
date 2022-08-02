const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mulamsg')
		.setDescription('Yes master?')
		.addStringOption(option => option.setName('saying').setDescription('Whatcha want me to say?').setRequired(true)),
	async execute(interaction) {
		const message = interaction.options.getString('saying');
		// TODO: switch case
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
		else if (interaction.user.id === '382652120421105677' && interaction.channel.id === '1001624424681832558') {
			await interaction.editReply(`Gotcha fams.`);
			interaction.channel.send(message);
		}
		else if (interaction.user.id === '99302148768030720' && interaction.channel.id === '1001907473386569800') {
			await interaction.editReply(`Gotcha fams.`);
			interaction.channel.send(message);
		}
		else if (interaction.user.id === '397580936964866048' && interaction.channel.id === '1003024958487793725') {
			await interaction.editReply(`Gotcha fams.`);
			interaction.channel.send(message);
		}
		else if (interaction.user.id === '871093154684747806' && interaction.channel.id === '1002601055042941019') {
			await interaction.editReply(`Tato hermano.`);
			interaction.channel.send(message);
		}
			else await interaction.editReply(`You ain't oishi, shoo.`);
		return "Done";
	}
}