const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('msg')
		.setDescription('Yes master?')
		.addStringOption(option => option.setName('saying').setDescription('Whatcha want me to say?').setRequired(true)),
	async execute(interaction) {
    const message = interaction.options.getString('saying');
    await interaction.reply({ content: `Sending message.`, ephemeral: true });
		interaction.channel.send(message);
  }
}
