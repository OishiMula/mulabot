const { SlashCommandBuilder } = require('@discordjs/builders');
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('floor')
		.setDescription('Retrieve the floor price')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project').toLowerCase();
		let msgPayload;

		// crew check - fun sayings
		if (projectName in mulaFN.CREW) {
			return await interaction.reply(`${projectName} - ${mulaFN.choose(mulaFN.CREW[projectName])}`)
		}

		// shortcut check
		if (projectName in mulaFN.SHORTCUTS) {
			projectName = mulaFN.SHORTCUTS[projectName];
		}

		let project = await mulaFN.download(projectName, 'project');
		if (project === "error") {
			console.error(`ERROR: Command: Floor - ${projectName}`);
			return await interaction.reply(`I couldn't find ${projectName} -- Typo maybe? Dum dum.`);
		}
		

		// Get CNFT Project Image
		const imgURL = await mulaFN.download(`${mulaFN.opencnftPolicyAPI}${project.policy_id}`, 'thumbnail');

		// Retrieve floor
		const jpgFloorJ = await mulaFN.download(`${mulaFN.jpgCollectionAPI}${project.policy_id}/floor`, 'data');
		const floorPrice = String(jpgFloorJ.floor / 1000000);

		msgPayload = {
			title : 'Floor',
			source : 'jpg',
			header : project.display_name,
			content : `Floor price: **₳${floorPrice}**
			[jpg.store link](${mulaFN.jpgStoreLink}${project.url})`,
			thumbnail : `${mulaFN.ipfsBase}${imgURL}`
		}

	const embed = await mulaFN.createMsg(msgPayload);
	console.log(`Command: Floor - ${project.display_name}`)
	await interaction.reply({ embeds: [ embed ] });

		



	},
};