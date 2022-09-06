/* eslint-disable no-return-assign */
/* eslint-disable no-loop-func */
/* eslint-disable no-lone-blocks */
/* eslint no-use-before-define: 0 */
const {
  SlashCommandBuilder, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, ComponentType, SelectMenuBuilder,
} = require('discord.js');
const ct = require('common-tags');
const { SQL } = require('../db');
const { createMsg, sleep, Tenor } = require('../mula_functions');
const { botIcon } = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Hi! How can I help you?'),
  async execute(interaction) {
    const exists = await SQL('guilds').select('guildid')
      .where({ guildid: interaction.guildId });
    const finished = await SQL('configs').select('setup')
      .where({ guildid: interaction.guildId });
    if (!exists.length > 0 || finished.setup === 0) {
      if (interaction.user.id === interaction.guild.ownerId) {
        await interaction.editReply('Starting setup');

        if (!exists.length > 0) {
          await interaction.editReply(`**${interaction.guild.name}** :: Creating database.`);

          await SQL('guilds').insert({
            guildid: interaction.guildId,
            name: interaction.guild.name,
            ownerid: interaction.user.id,
            interactions: 0,
          });
          await SQL('configs').insert({
            guildid: interaction.guildId,
            guildname: interaction.guild.name,
            gifs: 0,
            announcementchannel: 'n/a',
            twitterchannel: 'n/a',
            setup: 0,
          });

          await interaction.editReply(`**${interaction.guild.name}** :: Information saved.`);
        }

        await sleep(2000);
        await interaction.editReply(`**${interaction.guild.name}** :: I will need an **Announcement** and **Twitter** channel. Please link them by # and typing the channel name.`);
        await sleep(2000);
        let channelSetup = 0;
        let announceChannel, twitterChannel;
        do {
          let errorFlag = 0;
          const filter = (m) => m.author.id === interaction.user.id;
          await interaction.editReply(`**${interaction.guild.name}**  :: Please enter an **announcement channel**`);

          await interaction.channel.awaitMessages({
            filter, max: 1, time: 30000, errors: ['time'],
          })
            .then((msg) => {
              announceChannel = msg.first().content.replace(/[<>#]/g, '');
              interaction.channel.messages.delete(msg.first().id);
              if (!interaction.guild.channels.cache.get(announceChannel)) {
                interaction.editReply('Not a **valid** entry. Please try to link with: #channelname. Restarting ...');
                announceChannel = 0;
              }
            })
            .catch(() => {
              interaction.editReply("You didn't enter anything! Try the setup later.");
              errorFlag = 1;
            });
          if (errorFlag === 1) return 'not finished';
          if (announceChannel === 0) continue;

          await interaction.editReply(`**${interaction.guild.name}** :: Please enter a **twitter channel**`);

          await interaction.channel.awaitMessages({
            filter, max: 1, time: 30000, errors: ['time'],
          })
            .then((msg) => {
              twitterChannel = msg.first().content.replace(/[<>#]/g, '');
              interaction.channel.messages.delete(msg.first().id);
              if (!interaction.guild.channels.cache.get(twitterChannel)) {
                interaction.editReply('Not a **valid** entry. Please try to link with: #channelname. Restarting ...');
                twitterChannel = 0;
              }
            })
            .catch(() => {
              interaction.editReply("You didn't enter anything! Try the setup later.");
              errorFlag = 1;
            });
          if (errorFlag === 1) return 'not finished';
          if (twitterChannel === 0) continue;

          interaction.editReply(ct.stripIndents`**Confirm** if the following is okay:
            **Announcement channel** :: ${interaction.guild.channels.cache.get(announceChannel)}
            **Twitter channel** :: ${interaction.guild.channels.cache.get(twitterChannel)}
            Type **Y** to confirm. Type **N** to cancel. **Anything else** to retry.`);
          await interaction.channel.awaitMessages({
            filter, max: 1, time: 30000, errors: ['time'],
          })
            .then((msg) => {
              if (msg.first().content.toLowerCase().includes('y')) {
                interaction.editReply(ct.stripIndents`**${interaction.guild.name}** :: Saving first-time setup information.
                **Please wait.**`);
                channelSetup = 1;
              } else if (msg.first().content.toLowerCase().includes('n')) {
                interaction.editReply(`**${interaction.guild.name}** :: Discarding all information.`);
                errorFlag = 1;
              } else interaction.editReply(`**${interaction.guild.name}** :: One moment, let's try this again.`);

              interaction.channel.messages.delete(msg.first().id);
              sleep(3000);
            })
            .catch(() => {
              interaction.editReply("You didn't enter anything! Try the setup later.");
              errorFlag = 1;
            });
          if (errorFlag === 1) return 'not finished';
        } while (channelSetup === 0);

        await SQL('configs').update({
          announcementchannel: announceChannel,
          twitterchannel: twitterChannel,
          setup: 1,
        }).where({ guildid: interaction.guildId });
        await interaction.editReply(`**${interaction.guild.name}** :: Setup complete!`);
      } else {
        await interaction.editReply('You are not the owner.');
        return 'non-owner attempt';
      }
    } else { // Verified settings
      const guild = (await SQL('guilds').select('ownerid')
        .where({ guildid: interaction.guildId }))[0];
      if (guild.ownerid === interaction.user.id) {
        let errorFlag = 0;
        const msgPayload = {
          title: `Hello ${interaction.user.username}`,
          source: 'me',
          header: 'Administration',
          content: 'Welcome to the **Admin Panel**\nPlease choose from the buttons below.',
          thumbnail: `${botIcon}`,
        };
        const menuButtons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('addgif').setLabel('Add Random Gif').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('removegif').setLabel('Remove Gif').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('manage').setLabel('Manage Name/Status').setStyle(ButtonStyle.Secondary),
          );
        const filter = (i) => { i.deferUpdate(); return i.user.id === interaction.user.id; };
        let embed = await createMsg(msgPayload);
        await interaction.editReply({ embeds: [embed], components: [menuButtons] });
        let buttonChoice;
        try {
          buttonChoice = await interaction.channel.awaitMessageComponent({
            filter, componentType: ComponentType.Button, time: 50000,
          });
        } catch (error) {
          msgPayload.content = 'You did not choose anything. Goodbye!';
          embed = await createMsg(msgPayload);
          await interaction.editReply({ embeds: [embed], components: [] });
          // eslint-disable-next-line consistent-return
          return 'done';
        }

        switch (buttonChoice.customId) {
          case 'addgif': {
            msgPayload.title = 'Administration';
            msgPayload.header = 'Adding Gif';
            msgPayload.content = 'Enter the **gif word** that you would like to see.';
            embed = await createMsg(msgPayload);
            await interaction.editReply({ embeds: [embed], components: [] });

            const msgFilter = (m) => m.author.id === interaction.user.id;
            let userReply = await interaction.channel.awaitMessages({
              filter: msgFilter, max: 1, time: 30000, errors: ['time'],
            });
            const gifWord = userReply.first().content.toLowerCase();
            userReply.first().delete();

            let gif;
            await Tenor.Search.Query(gifWord, '5').then((results) => {
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
            const confirmChoice = await interaction.channel.awaitMessageComponent({
              filter,
              componentType: ComponentType.Button,
              time: 50000,
            });

            gifMsg.delete();
            if (confirmChoice.customId === 'yes') {
              msgPayload.content = 'Enter the **word** that will trigger the gif.';
              embed = await createMsg(msgPayload);
              await interaction.editReply({ embeds: [embed], components: [] });
              userReply = await interaction.channel.awaitMessages({
                filter: msgFilter, max: 1, time: 30000, errors: ['time'],
              });
              const triggerWord = userReply.first().content.toLowerCase();
              userReply.first().delete();

              msgPayload.content = `Saving **${gifWord}** :: Trigger: **${triggerWord}**`;
              embed = await createMsg(msgPayload);
              await interaction.editReply({ embeds: [embed], components: [] });
              await SQL('gifs').insert({
                giftrigger: triggerWord,
                gifsearch: gifWord,
                gid: interaction.guildId,
              });
            } else {
              msgPayload.content = `I won't save **${gifWord}**`;
              embed = await createMsg(msgPayload);
              await interaction.editReply({ embeds: [embed], components: [] });
            }
          }
            return 'gif added';

          case 'removegif': {
            msgPayload.title = 'Administration';
            msgPayload.header = 'Removing Gif';
            msgPayload.content = 'From the list below\nPlesae choose a Gif you wish for me to **remove**.';
            embed = await createMsg(msgPayload);

            const gifList = await SQL('gifs').select('giftrigger', 'gifsearch')
              .where({ gid: interaction.guildId });

            const gifsRow = new ActionRowBuilder()
              .addComponents(
                new SelectMenuBuilder()
                  .setCustomId('gifs')
                  .setPlaceholder('Gif terms currently on the server'),
              );

            for (const gif of Object.keys(gifList)) {
              const { giftrigger, gifsearch } = gifList[gif];
              gifsRow.components[0].addOptions({
                label: giftrigger,
                description: `Searches: ${gifsearch}`,
                value: giftrigger,
              });
            }

            await interaction.editReply({ embeds: [embed], components: [gifsRow] });
            const selectFilter = (i) => {
              i.deferUpdate();
              return i.user.id === interaction.user.id;
            };
            const removalChoice = await interaction.channel.awaitMessageComponent({
              filter: selectFilter, componentType: ComponentType.SelectMenu, time: 30000, max: 1,
            })
              .catch(() => errorFlag = 1);
            if (errorFlag === 1) {
              msgPayload.content = '**Timed out!** :: Sorry, try again?';
              embed = await createMsg(msgPayload);
              await interaction.editReply({ embeds: [embed], components: [] });
              return 'error';
            }

            const removalGif = removalChoice.values[0];
            msgPayload.content = `Understood, removing: **${removalGif}**`;
            embed = await createMsg(msgPayload);
            await interaction.editReply({ embeds: [embed], components: [] });

            await SQL('gifs').where({ gid: interaction.guildId, giftrigger: removalGif }).del();
          }
            return 'gif removed';
          case 'manage': {
            msgPayload.title = 'Administration';
            msgPayload.header = 'Manage me!';
            msgPayload.content = '** Coming soon **';

            embed = await createMsg(msgPayload);
            await interaction.editReply({ embeds: [embed], components: [] });
          }
            break;

          default:
            await interaction.editReply('No authorization.');
            break;
        }
      } else {
        const msgPayload = {
          title: `Hello ${interaction.user.username}`,
          source: 'me',
          header: 'Administration',
          content: 'Hey! You can\'t be here!.',
          thumbnail: `${botIcon}`,
        };

        const embed = await createMsg(msgPayload);
        await interaction.editReply({ embeds: [embed] });
      }
    }
    return 'done';
  },
};
