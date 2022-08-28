const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { hypeMultipler } = require('../config/config');
const mulaFN = require('../mula_functions');
const api = require('../config/api');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('floor')
		.setDescription('Retrieve the floor price')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project').toLowerCase();
		let msgPayload, row;

		// crew check - fun sayings
		if (mulaFN.crewCheck(projectName)) {
			console.log(`Command: Floor | Crew - ${projectName} -- ${interaction.user.tag}`);
			await interaction.editReply(`${projectName} - ${mulaFN.choose(mulaFN.CREW[projectName])}`);
			return "Done";
		}

		projectName = await mulaFN.shortcutCheck(projectName);

		const project = await mulaFN.download(projectName, 'project');
		if (project === "error") return ['error', projectName];

		// Get CNFT Project Image
		const imgURL = await mulaFN.download(`${api.opencnftPolicy}${project.policy_id}`, 'thumbnail');

		// Retrieve floor
		const jpgFloorJ = await mulaFN.download(`${api.jpgCollection}${project.policy_id}/floor`, 'data');
		const floorPrice = String(jpgFloorJ.floor / 1000000);

		msgPayload = {
			title: 'Floor',
			source: 'jpg',
			header: project.display_name,
			content: `Floor price: **₳${floorPrice}**
			[jpg.store link](${api.jpgStore}${project.url})`,
			thumbnail: `${api.ipfsBase}${imgURL}`
		}

		if (floorPrice < 30) {
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('hype')
						.setLabel('HYPE')
						.setStyle(ButtonStyle.Primary),
			);
		}

		const embed = await mulaFN.createMsg(msgPayload);
		await interaction.editReply({
			embeds: [embed], 
			components: ((row === undefined) ? [] : [row])
		});
		
		if (row !== undefined) {
			let hypeFlag = 1;
			const hypeActivate = await interaction.channel.awaitMessageComponent({  componentType: ComponentType.Button, time: 5000 })
			.catch( () => { hypeFlag = 0; });
			if (hypeFlag === 0) {
				await interaction.editReply({ components: [] });
			}
			else {
				if (hypeActivate.customId === 'hype') {
					const hypeFloorPrice = hypeMultipler === 1 ? 'WAIT- NO HYPE! Your shit is at ₳8 rugpull status.' : String((jpgFloorJ.floor / 1000000) * hypeMultipler);
					msgPayload.content = `Floor price: **₳${hypeFloorPrice}**
					[jpg.store link](${api.jpgStore}${project.url})`,
					msgPayload.title = "HYPED floor";
					msgPayload.source = "me";
					const hypeEmbed = await mulaFN.createMsg(msgPayload);
					await interaction.editReply({ embeds: [hypeEmbed], components: [] });
					return `hyped ${project.display_name}`;
				}
			}
		}

		return project.display_name;
	},
};