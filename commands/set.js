const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set')
		.setDescription('Wanna change my name or status?')
		.addStringOption(option => option.setName('name').setDescription('What is my new name?'))
		.addStringOption(option => option.setName('status').setDescription('What is my new status?')),
	async execute(interaction) {
		let newName, newStatus;

		try {
			newName = interaction.options.getString('name');
		} catch (error) {
			console.log("ding")
			newName = 0;
		}
		try {
			newStatus = interaction.options.getString('status');
		} catch (error) {
			newStatus = 0;
		}

		console.log(newName)
		console.log(newStatus)
		if (interaction.user.id === '374929603594027018') {
			if (newName) {
				await interaction.editReply({
					content: `Setting name as ${newName}`,
					ephemeral: true
				});
				interaction.client.user.setUsername(newName);
			}
			if (newStatus) {
				await interaction.editReply({
					content: `Setting status as ${newStatus}`,
					ephemeral: true
				});
				interaction.client.user.setActivity(newStatus);
			}
		} else await interaction.editReply({
			content: `You ain't oishi, shoo.`,
			ephemeral: true
		});
		return "Done";
	}
}