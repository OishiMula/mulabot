const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('msg')
		.setDescription('Yes master?')
		.addStringOption(option => option.setName('saying').setDescription('Whatcha want me to say?').setRequired(true)),
	async execute(interaction) {
    const message = interaction.options.getString('saying');
		if (interaction.user.id === '374929603594027018') {
			await interaction.reply({ content: `Sending message.`, ephemeral: true });
			interaction.channel.send(message);
		}
		else {
			console.log(`Command: Msg - ${message.author.tag}`)
			await interaction.reply({ content: `You ain't oishi, shoo.`, ephemeral: true });
		}
  }
}
