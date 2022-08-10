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
		.addSubcommand(subcommand =>
			subcommand
				.setName('editmulamsg')
				.setDescription("Edit an exiting bot message")
				.addStringOption(option => option.setName('chan').setDescription("Provide the ChannelID").setRequired(true))
				.addStringOption(option => option.setName('msgid').setDescription("Provide the MessageID").setRequired(true))
				.addStringOption(option => option.setName('editmsg').setDescription("Provide the new message to enter").setRequired(true))
		),
	async execute(interaction) {
		let allowed = ['374929603594027018', '365119859568148481'];
		if (!allowed.includes(interaction.user.id)) await interaction.editReply(`You ain't oishi, shoo.`);
		//if (interaction.user.id !== '374929603594027018') await interaction.editReply({content: `You ain't oishi, shoo.`,ephemeral: true});
		
		else {
			let newname, newstatus, msgid, rrsetup;
			try { newname = interaction.options.getString('newname') } catch(error) { newname = " "; }
			try { newstatus = interaction.options.getString('newstatus') } catch(error) { newstatus = " "; }
			try { msgid = interaction.options.getString('msgid') } catch(error) { msgid = " "; }
			try { rrsetup = interaction.options.getBoolean('setup') } catch(error) { rrsetup = false }
			console.log(rrsetup);
	
			if (newname !== null) {
				await interaction.editReply(`Setting name as **${newname}**`);
				console.log(`INFO: New name: ${newname}`)
				interaction.client.user.setUsername(newname);
			}

			if (newstatus !== null) {
				await interaction.editReply(`Setting status as Playing **${newstatus}**`);
				console.log(`Info: New status: ${newstatus}`);
				interaction.client.user.setActivity(newstatus);
			}
			
			if (msgid !== null) {
				let message = interaction.options.getString('editmsg');
				let msgChannel = interaction.options.getString('chan');
				let oldMessage;
				
				// retrieve older message
				try {
					channelData = await interaction.client.channels.cache.find(channelList => channelList.id === msgChannel);
					oldMessage = await channelData.messages.fetch(msgid);
				} catch (error) {
					await interaction.editReply(`Error: Please check the ChannelID and MessageId`);
					return "error";
				}
				
				if (!oldMessage.author.bot) {
					await interaction.editReply(`Error: Please check the MessageID`);
					return "error";
				}
				
				oldMessage.edit(message);
				await interaction.editReply(`Editing messageID: **${msgid}**`);

				console.log(`INFO: Edit on ${msgid} with: ${message}`)
				return "Edit Mula Msg"
				}

			// Reaction Roles
			if (rrsetup === true) {
				await interaction.editReply("Starting collection");
				const filter = m => m.author.id.includes(interaction.user.id);
				const collector = interaction.channel.createMessageCollector({ filter, max: 10, dispose: true })
				let reactRoles = [];

				collector.on('collect', m => { 
					console.log('ding');
					if (m.content === 'end') {
						collector.dispose(m);
						collector.stop();
					}
				});

				collector.on('end', collected => {
					collected.forEach(message => {
						if (message.content === 'end') return;
							reactRoles.push(message.content.split(" "));
						})
						
						// Left off here, figure out how to dynamically add "reaction roles"
						for (message in reactRoles) {
							console.log(reactRoles[message][0]);
						}
						console.log(reactRoles);
				});
			}
			
		}
		return "Done";
	}
}
