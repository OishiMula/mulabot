/* Mula Bot - Revamped in Node.js!
Created by Oishi Mula, 5/1/2022 
pm2 Timestamp / add entry:
pm2 start index.js --name MulaBot --log-date-format "MM-DD | hh:mm:ss a"
*/

// Add required libs
require('dotenv').config();
const fs = require('node:fs');
const path = require('path');
const token = process.env.MULA_TOKEN;
const randomFile = require('select-random-file') 
const extrasPath = '/home/pi/projects/js/mula_bot/extras/'
const epochFile = '/home/pi/projects/js/mula_bot/extras/epoch.txt'

// Create Discord client Instance
const { Client, Collection, Intents } = require('discord.js');
const { download } = require('./mula_functions');
const discordIntents = new Intents();
discordIntents.add(Intents.FLAGS.GUILDS, 
	Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, 
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
	Intents.FLAGS.DIRECT_MESSAGES, 
	Intents.FLAGS.GUILD_MESSAGES)
const client = new Client({ intents: discordIntents });

// To load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

async function writeFile(data, file) {
  fs.writeFileSync(file, JSON.stringify(data), (err) => {
    if (err) console.log(err);
  });
}

client.once('ready', async () => {
  console.log("Mula Bot Starting");
	// Epoch Countdown loop
	const checkMinutes = 0.1, checkInterval = checkMinutes * 60 * 1000;
	setInterval(async () => {
		// File check
		if (!fs.existsSync(`${extrasPath}epoch.txt`)) {
			console.error("Error with Epoch file");
			const firstTimeEpoch = await download('null', 'epoch');
			await writeFile(firstTimeEpoch, epochFile);
		}

		// Check epoch end's time and compare
		const epoch = await download(epochFile, 'local');
		const now = new Date().getTime();
		if (epoch.end > now) {
			console.log(`New Epoch -- Epoch ${epoch.current}`)
			const annoucementsChannel = client.channels.cache.get('941428920488718406');
			annoucementsChannel.send(`TESTING!
			<a:sirenred:944494985288515644> **A NEW EPOCH HAS BEGUN!** <a:sirenred:944494985288515644>
			We are now on **Epoch ${epoch.current}** 
			Don't forget your Dripdropz at https://dripdropz.io/`);
			const newEpoch = await download('null', 'epoch');
			await writeFile(newEpoch, epochFile);
		}
	}, checkInterval);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('messageCreate',async (message) => {
	if(message.author.bot) return;

	// Plxce Beats
	if (message.content.toLowerCase() === "drop the beat") {
		console.log(`Drop the beat Triggered -- ${message.author.tag}`)
		await message.channel.send({
			files: [{
				attachment: `${extrasPath}herewego.gif`,
				name: `hereweGO.gif`
			},
			{
				attachment: `${extrasPath}brunch_for_dinner.mp3`,
				name: `brunch_for_dinner.mp3`
			}]
		});
	}

	// Sheesh
	if (message.content.toLowerCase().split(" ").includes('sheesh')) {
		console.log(`Sheesh Triggered -- ${message.author.tag}`)
		await message.channel.send({
			files: [{
				attachment: `${extrasPath}sheesh.mp3`,
				name: `sheesh.mp3`
			}]
		});
	}

	// bitconnect
	if (message.content.toLowerCase().split(" ").includes('bitconnect')) {
		console.log(`Bitconnect Triggered -- ${message.author.tag}`)
		await message.channel.send({
			content: "Did someone say.. bitconnect?",
			files: [{
				attachment: `${extrasPath}bitconnnnnnnnect.mp3`,
				name: `BITCONNNNNNNNNNNNNNNECT.mp3`
			}]
		});
	}

	// real kong shit
	if (message.content.toLowerCase().includes('real kong shit')) {
		console.log(`Real kong shit Triggered -- ${message.author.tag}`)
		await message.channel.send({
			files: [{
				attachment: `${extrasPath}realkongshit.mp4`,
				name: `realkongshitbyplxce.mp4`
			}]
		});
	}

	// Puta
	if (message.content.toLowerCase().split(" ").includes('puta')) {
		console.log(`Puta Triggered -- ${message.author.tag}`)
		await message.channel.send({
			files: [{
				attachment: `${extrasPath}puta.gif`,
				name: `malditaPUTAcono.gif`
			}]
		});
	}

	// Jimmy 
	if (message.content.toLowerCase().split(" ").includes('jimmy')) {
		console.log(`Jimmy Triggered -- ${message.author.tag}`)
		const jimmyDir = `${extrasPath}/jimmy`
		randomFile(jimmyDir, (Err, jimmyGif) => {
			message.channel.send({
				files: [{
					attachment: `${jimmyDir}/${jimmyGif}`,
					name: `JIMMY.gif`
				}]
			});
		});
	}

	// Degen 
	if (message.content.toLowerCase().split(" ").includes('degen')) {
		console.log(`Degen Triggered -- ${message.author.tag}`)
		const degenDir = `${extrasPath}/degen`
		randomFile(degenDir, (Err, degenGif) => {
			message.channel.send({
				files: [{
					attachment: `${degenDir}/${degenGif}`,
					name: `degenbois.gif`
				}]
			});
		});
	}

	// Cardano
	if (message.content.toLowerCase().split(" ").includes('cardano')) {
		console.log(`Cardano Triggered -- ${message.author.tag}`)
		const cardanoDir = `${extrasPath}/cardano`
		randomFile(cardanoDir, (Err, cardanoGif) => {
			message.channel.send({
				files: [{
					attachment: `${cardanoDir}/${cardanoGif}`,
					name: `believeInCardano.gif`
				}]
			});
		});
	}

	// Crypto / Bear
	if (message.content.toLowerCase().split(" ").includes('bear') || message.content.toLowerCase().split(" ").includes('crypto')) {
		console.log(`Crypto/Bear Triggered -- ${message.author.tag}`)
		const cryptoDir = `${extrasPath}/crypto`
		randomFile(cryptoDir, (Err, cryptoGif) => {
			message.channel.send({
				files: [{
					attachment: `${cryptoDir}/${cryptoGif}`,
					name: `WAGMIIII.gif`
				}]
			});
		});
	}

	// RIP
	if (message.content.toLowerCase().split(" ").includes('rip') || message.content.toLowerCase().split(" ").includes('gingers')) {
		console.log(`Rip/Gingers Triggered -- ${message.author.tag}`)
		const ripDir = `${extrasPath}/rip`
		randomFile(ripDir, (Err, ripGif) => {
			message.channel.send({
				files: [{
					attachment: `${ripDir}/${ripGif}`,
					name: `ripMfer.gif`
				}]
			});
		});
	}

	// Solana Summer
	if (message.content.toLowerCase().split(" ").includes('solana')) {
		console.log(`Solana Triggered -- ${message.author.tag}`)
		const solanaDir = `${extrasPath}/solana`
		randomFile(solanaDir, (Err, solanaGif) => {
			message.channel.send({
				files: [{
					attachment: `${solanaDir}/${solanaGif}`,
					name: `EWWsolanaWTF.gif`
				}]
			});
		});
	}

	// Shillington
	if (message.content.toLowerCase().split(" ").includes('shillington') || message.content.toLowerCase().split(" ").includes('ups')) {
		console.log(`Shillington/UPS Triggered -- ${message.author.tag}`)
		const upsDir = `${extrasPath}/ups`
		randomFile(upsDir, (Err, upsGif) => {
			message.channel.send({
				files: [{
					attachment: `${upsDir}/${upsGif}`,
					name: `UPSManShillington.gif`
				}]
			});
		});
	}
		
	// here we go
	if (message.content.toLowerCase().includes("here we go")) {
		console.log(`Here we go Triggered -- ${message.author.tag}`)
		const herewegoDir = `${extrasPath}/herewego`
		randomFile(herewegoDir, (Err, herewegoGif) => {
			message.channel.send({
				files: [{
					attachment: `${herewegoDir}/${herewegoGif}`,
					name: `hereweGO.gif`
				}]
			});
		});
	}

	// mini messi
	if (message.content.toLowerCase().split(" ").includes("mini messi") || message.content.toLowerCase().split(" ").includes('messi')) {
		console.log(`Messi Triggered -- ${message.author.tag}`)
		const minimessiDir = `${extrasPath}/messi`
		randomFile(minimessiDir, (Err, minimessiGif) => {
			message.channel.send({
				files: [{
					attachment: `${minimessiDir}/${minimessiGif}`,
					name: `minimessi.gif`
				}]
			});
		});
	}

	});


/* Commands Missing:
TODO: toke
TODO: mmm
TODO: traitfloor
TODO: addproject
*/

client.login(token);

