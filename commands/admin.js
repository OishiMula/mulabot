/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-empty */
const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('Hi! How can I help you?')
		.addSubcommandGroup(group => 
			group
			.setName('set')
			.setDescription("Change information regarding Mula Bot")
				.addSubcommand(subcommand =>
					subcommand
						.setName('name')
						.setDescription("Change Mula Bot's name")
						.addStringOption(option => option.setName('newname').setDescription("What is the new name?").setRequired(true))
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('status')
						.setDescription("Change Mula Bot's status")
						.addStringOption(option => option.setName('newstatus').setDescription("What is the new status").setRequired(true))
				)
		)
		.addSubcommandGroup(group =>
			group
			.setName('reactionroles')
			.setDescription("Prepare the Reaction Roles")
				.addSubcommand(subcommand =>
					subcommand
						.setName('setup')
						.setDescription("Set up Reaction Roles")
						.addStringOption(option => option.setName('setup').setDescription("N/A").setRequired(true))
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('edit')
						.setDescription("Edit existing Reaction Roles")
						.addStringOption(option => option.setName('edit').setDescription("N/A").setRequired(true))
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('editmulamsg')
				.setDescription("Edit an exiting bot message")
				.addStringOption(option => option.setName('chan').setDescription("Provide the ChannelID").setRequired(true))
				.addStringOption(option => option.setName('msgid').setDescription("Provide the MessageID").setRequired(true))
				.addStringOption(option => option.setName('editmsg').setDescription("Provide the new message to enter").setRequired(true))
		),
	async execute(interaction) {
		if (interaction.user.id !== '374929603594027018') await interaction.editReply({content: `You ain't oishi, shoo.`,ephemeral: true});
		
		else {
			let newname, newstatus, setup, edit, messageId, msgchannel, message;
			try { newname = interaction.options.getString('newname') } catch(error) { newname = " "; }
			try { newstatus = interaction.options.getString('newstatus') } catch(error) { newstatus = " "; }
			try { msgid = interaction.options.getString('msgid') } catch(error) { msgid = " "; }
	
			if (newname !== null) {
				await interaction.editReply({
					content: `Setting name as **${newname}**`,
					ephemeral: true
				});
				console.log(`INFO: New status: ${newname}`)
				interaction.client.user.setUsername(newname);
			}

			if (newstatus !== null) {
				// TODO: Add type
				await interaction.editReply({
					content: `Setting status as Playing **${newstatus}**`,
					ephemeral: true
				});
				console.log(`Info: New status: ${newstatus}`)
				interaction.client.user.setActivity(newstatus);
			}
			
			if (msgid !== null) {
				message = interaction.options.getString('editmsg');
				msgChannel = interaction.options.getString('chan');
				
				/* -- not retrieving channel properly
				channelData = interaction.channels.cache.get(msgchannel);
				console.log(channelData);
				let oldMessage = channelData.messages.cache.get(msgid);

				console.log(oldMessage);
				oldMessage.edit(message);

				await interaction.editReply({
					content: `Editing messageID: ${messageId}**`,
					ephemeral: true
				});
				console.log(`INFO: Edit on ${msgid} with: ${message}`)
				return "Edit Mula Msg"
				*/
				// TODO: fix up with better validation
				// pick a channel, enter a message id

				

				/*
				await interaction.followUp('Please enter the #Channel name');
				if (interaction.user.id === '374929603594027018') {
					let channelName = interaction.client.message.content;
					console.log(channelName);
				}
				*/

					//let channelName = await interaction.channel.awaitMessageComponent({ filter, max: 1 });
					//console.log(channelName);
					
					//let reactChannel = client.channels.cache.get('941434566697164901')
					//let reactMsg = await client.channels.cache.get('941434566697164901').messages.fetch('1003868951681450115');
			
				}
		}

		/*
		try {
			newName = interaction.options.getString('name');
		} catch (error) {
			newName = 0;
		}
		try {
			newStatus = interaction.options.getString('status');
		} catch (error) {
			newStatus = 0;
		}
*/

		return "Done";
	}
}
