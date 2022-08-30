/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SelectMenuBuilder } = require('discord.js');
const { guildsDB, configsDB, gifsDB } = require('../db');
const { createMsg, sleep, Tenor } = require('../mula_functions');
const { botIcon } = require('../config/config');
const ct = require('common-tags');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('admin')
		.setDescription('Hi! How can I help you?'),
	async execute(interaction) {
		const exists = (await guildsDB.findAll({ attributes: ['guildid'], raw: true })).filter(g => g.guildid === interaction.guildId);
		const finished = await configsDB.findOne({ attributes: ['setup'], where: { guildid: interaction.guildId }, raw: true });
		if (!exists.length > 0 || finished.setup === 0) {
			if (interaction.user.id === interaction.guild.ownerId) {
				await interaction.editReply("Starting setup");

				if (!exists.length > 0 ) {
					await interaction.editReply(`**${interaction.guild.name}** :: Creating database.`)
					await guildsDB.create({ guildid: interaction.guildId, name: interaction.guild.name, ownerid: interaction.user.id });
					await configsDB.create({ guildid: interaction.guildId, guildname: interaction.guild.name, gif: 0, announcementchannel: 'n/a', twitterchannel: 'n/a', setup: 0});
					await interaction.editReply(`**${interaction.guild.name}** :: Information saved.`)
				}

				await sleep(2000);
				await interaction.editReply(`**${interaction.guild.name}** :: I will need an **Announcement** and **Twitter** channel. Please link them by # and typing the channel name.`);
				await sleep(2000);
				let channelSetup = 0;
				let announceChannel, twitterChannel;
				do {
					let errorFlag = 0;
					const filter = m => { return m.author.id == interaction.user.id; }
					await interaction.editReply(`**${interaction.guild.name}**  :: Please enter an **announcement channel**`);

					let userReply = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
					.then(msg => {
						announceChannel = msg.first().content.replace(/[<>#]/g, '');
						interaction.channel.messages.delete(msg.first().id);
						if (!interaction.guild.channels.cache.get(announceChannel)) {
							interaction.editReply("Not a **valid** entry. Please try to link with: #channelname. Restarting ...");
							announceChannel = 0;
						}
					})
					.catch(end => {
						interaction.editReply("You didn't enter anything! Try the setup later.");
						errorFlag = 1;
					})
					if (errorFlag === 1) return 'not finished';
					if (announceChannel === 0) continue;

					
					await interaction.editReply(`**${interaction.guild.name}** :: Please enter a **twitter channel**`);
					
					userReply = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
					.then(msg => {
						twitterChannel = msg.first().content.replace(/[<>#]/g, '');
						interaction.channel.messages.delete(msg.first().id);
						if (!interaction.guild.channels.cache.get(twitterChannel)) {
							interaction.editReply("Not a **valid** entry. Please try to link with: #channelname. Restarting ...");
							twitterChannel = 0;
						}
					})
					.catch(end => {
						interaction.editReply("You didn't enter anything! Try the setup later.");
						errorFlag = 1;
					})
					if (errorFlag === 1) return 'not finished';
					if (twitterChannel === 0) continue;

					interaction.editReply(ct.stripIndents`**Confirm** if the following is okay:
						**Announcement channel** :: ${interaction.guild.channels.cache.get(announceChannel)}
						**Twitter channel** :: ${interaction.guild.channels.cache.get(twitterChannel)}
						Type **Y** to confirm. Type **N** to cancel. **Anything else** to retry.`);
					userReply = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
						.then(msg => {
							if (msg.first().content.toLowerCase().includes('y')) {
								interaction.editReply(ct.stripIndents`**${interaction.guild.name}** :: Saving first-time setup information.
								**Please wait.**`);
								channelSetup = 1;
							}
							else if (msg.first().content.toLowerCase().includes('n')) {
								interaction.editReply(`**${interaction.guild.name}** :: Discarding all information.`);
								errorFlag = 1;
							}
							else interaction.editReply(`**${interaction.guild.name}** :: One moment, let's try this again.`);

							interaction.channel.messages.delete(msg.first().id);
							sleep(3000);
						})
						.catch(end => {
							interaction.editReply("You didn't enter anything! Try the setup later.");
							errorFlag = 1;
						})
						if (errorFlag === 1) return 'not finished';
				} while(channelSetup === 0)
				
				await configsDB.update({ announcementchannel: announceChannel, twitterchannel: twitterChannel, setup: 1 }, { where: { guildid: interaction.guildId }});
				await interaction.editReply(`**${interaction.guild.name}** :: Setup complete!`);
				
			}
			else {
				await interaction.editReply("You are not the owner.");
				return 'non-owner attempt';
			}
		}
		// Settings are verified
		else {
			const guild = await guildsDB.findOne({ attributes: ['ownerid'], where: { guildid: interaction.guildId }, raw: true });
			if (guild.ownerid === interaction.user.id) {
				let errorFlag = 0;
				let msgPayload = {
					title: `Hello ${interaction.user.username}`,
					source: 'me',
					header: 'Administration',
					content: `Welcome to the **Admin Panel**\nPlease choose from the buttons below.`,
					thumbnail: `${botIcon}`
				} 
				const menuButtons = new ActionRowBuilder()
					.addComponents(
							new ButtonBuilder()
								.setCustomId('addgif')
								.setLabel('Add Random Gif')
								.setStyle(ButtonStyle.Primary),
							new ButtonBuilder()
								.setCustomId('removegif')
								.setLabel('Remove Gif')
								.setStyle(ButtonStyle.Danger),
							new ButtonBuilder()
								.setCustomId('manage')
								.setLabel('Manage Name/Status')
								.setStyle(ButtonStyle.Secondary)
					);
				const filter = i => {i.deferUpdate(); return i.user.id === interaction.user.id; }
				let embed = await createMsg(msgPayload);
				await interaction.editReply({ embeds: [embed], components: [menuButtons] });
				const buttonChoice = await interaction.channel.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 50000 });
				

				switch (buttonChoice.customId) {
					case 'addgif': {
						msgPayload.title = "Administration"
						msgPayload.header = 'Adding Gif';
						msgPayload.content = `Enter the **gif word** that you would like to see.`;
						embed = await createMsg(msgPayload);
						await interaction.editReply({ embeds: [embed], components: [] });
						const msgFilter = m => { return m.author.id == interaction.user.id; }
						let userReply = await interaction.channel.awaitMessages({ msgFilter, max: 1, time: 30000, errors: ['time'] })
						const gifWord = userReply.first().content;
						userReply.first().delete();
	
						let gif;
						await Tenor.Search.Query(gifWord, "5").then(results => {
							const randomGif = results[Math.floor(Math.random() * results.length)];
							gif = randomGif.url;
						});
	
						msgPayload.content = `You said: **${gifWord}** which contains gifs such as`;
						embed = await createMsg(msgPayload);
						await interaction.editReply({ embeds: [embed] });
						const gifMsg = await interaction.channel.send(gif);
						await sleep(1000);
	
						msgPayload.content = `You said: **${gifWord}** which contains gifs such as\n **Do you wish to save the gif term?**`;
						embed = await createMsg(msgPayload);
						const confirmButtons = new ActionRowBuilder()
							.addComponents(
									new ButtonBuilder()
										.setCustomId('yes')
										.setLabel('Yes')
										.setStyle(ButtonStyle.Primary),
									new ButtonBuilder()
										.setCustomId('no')
										.setLabel('No')
										.setStyle(ButtonStyle.Danger),
							);
						await interaction.editReply({ embeds: [embed], components: [confirmButtons] });
						const confirmChoice = await interaction.channel.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 50000 });
						
						gifMsg.delete();
						if (confirmChoice.customId === 'yes') {
							msgPayload.content = `Enter the **word** that will trigger the gif.`;
							embed = await createMsg(msgPayload);
							await interaction.editReply({ embeds: [embed], components: [] });
							userReply = await interaction.channel.awaitMessages({ msgFilter, max: 1, time: 30000, errors: ['time'] })
							const triggerWord = userReply.first().content;
							userReply.first().delete();
	
							msgPayload.content = `Saving **${gifWord}** :: Trigger: **${triggerWord}**`;
							embed = await createMsg(msgPayload);
							await interaction.editReply({ embeds: [embed], components: []});
							await gifsDB.create({ giftrigger: triggerWord, gifsearch: gifWord, gid: interaction.guildId });
						}
						else {
							msgPayload.content = `I won't save **${gifWord}**`;
							embed = await createMsg(msgPayload);
							await interaction.editReply({ embeds: [embed], components: []});
						}
					}
						return `gif added`;
					case 'removegif': {
						msgPayload.title = "Administration";
						msgPayload.header = 'Removing Gif';
						msgPayload.content = `From the list below\nPlesae choose a Gif you wish for me to **remove**.`;
						embed = await createMsg(msgPayload);
	
						const gifList = await gifsDB.findAll({ 
							attributes: ['giftrigger', 'gifsearch'], 
							where: { gid: interaction.guildId }, 
							raw: true 
						});
						const gifsRow = new ActionRowBuilder()
							.addComponents(
								new SelectMenuBuilder()
									.setCustomId('gifs')
									.setPlaceholder('Gif terms currently on the server')
							);
	
						for (let gif in gifList) {
							const { giftrigger, gifsearch} = gifList[gif];
							gifsRow.components[0].addOptions({
								label: giftrigger,
								description: `Searches: ${gifsearch}`,
								value: giftrigger
							});
						}
	
						await interaction.editReply({ embeds: [embed], components: [gifsRow] });
						const selectFilter = i => { i.deferUpdate(); return i.user.id === interaction.user.id; };
						const removalChoice = await interaction.channel.awaitMessageComponent({ selectFilter, componentType: ComponentType.SelectMenu, time: 30000, max: 1 })
						.catch( () => errorFlag = 1 )
						if (errorFlag === 1) {
							msgPayload.content = `**Timed out!** :: Sorry, try again?`;
							embed = await createMsg(msgPayload);
							await interaction.editReply({ embeds: [embed], components: [] });
							return 'error';
						}
	
						const removalGif = removalChoice.values[0];
						msgPayload.content = `Understood, removing: **${removalGif}**`;
						embed = await createMsg(msgPayload);
						await interaction.editReply({ embeds: [embed], components: [] });
					
						await gifsDB.destroy({ where: { gid: interaction.guildId, giftrigger: removalGif }});
					}
						return `gif removed`;
				case 'manage': {
					msgPayload.title = "Administration"
					msgPayload.header = 'Manage me!';
					msgPayload.content = `** Coming soon **`;

					embed = await createMsg(msgPayload);
					await interaction.editReply({ embeds: [embed], components: [] });
					}
					break;

				default: 
					await interaction.editReply("No authorization.")
					break;
				}
			}	
		}
		return 'done';
	}
}


/* 
OLDER CODE

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

	*/