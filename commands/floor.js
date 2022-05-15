const { SlashCommandBuilder } = require('@discordjs/builders');
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tfloor')
		.setDescription('Retrieve the floor price')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project').toLowerCase();

		// crew check - fun sayings
		if (projectName in mulaFN.CREW) {
			return await interaction.reply(`${projectName.toProperCase()} - ${mulaFN.choose(mulaFN.CREW[projectName])}`)
		}

		// shortcut check
		if (projectName in mulaFN.SHORTCUTS) {
			projectName = mulaFN.SHORTCUTS[projectName];
		}

		// Retrieve proeject name <--> PolicyID match
		const project = await mulaFN.download(`${mulaFN.jpgPolicyLookupAPI}${projectName}&size=500`, 'project');
		// TODO: TypeError: Cannot read properties of undefined (reading 'url')
		
		// Get CNFT Project Image
		const imgURL = await mulaFN.download(`${mulaFN.opencnftPolicyAPI}${project.policyID}`, 'thumbnail');

		// Retrieve floor
		const jpgFloorJ = await mulaFN.download (`${mulaFN.jpgCollectionAPI}${project.policyID}/floor`, 'data');
		const floorPrice = String(jpgFloorJ.floor / 1000000);

		const msgPayload = {
			title : 'Floor',
			mp : 'jpg',
			projectName : project.properName,
			content : `Floor price: **₳${floorPrice}**
			[jpg.store link](${mulaFN.jpgStoreLink}${project.name})`,
			thumbnail : `${mulaFN.ipfsBase}${imgURL}`
		}
		const embed = await mulaFN.createMsg(msgPayload);
		await interaction.reply({ embeds: [ embed ] });
	},
};