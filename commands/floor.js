const {	SlashCommandBuilder } = require('@discordjs/builders');
const mulaFN = require('../mula_functions');
const api = require('../config/api');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('floor')
		.setDescription('Retrieve the floor price')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project').toLowerCase();
		let msgPayload;

		// crew check - fun sayings
		if (mulaFN.crewCheck(projectName)) {
			console.log(`Command: Floor | Crew - ${projectName} -- ${interaction.user.tag}`);
			await interaction.editReply(`${projectName} - ${mulaFN.choose(mulaFN.CREW[projectName])}`);
			return "Done";
		}

		projectName = mulaFN.shortcutCheck(projectName);

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

		const embed = await mulaFN.createMsg(msgPayload);

		await interaction.editReply({
			embeds: [embed]
		});
		return project.display_name;
	},
};