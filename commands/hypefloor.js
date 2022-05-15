const { SlashCommandBuilder } = require('@discordjs/builders');
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('thypefloor')
		.setDescription('When you need to feel really really good')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project');

		// shortcut check
		if (projectName in mulaFN.SHORTCUTS) {
			projectName = mulaFN.SHORTCUTS[projectName];
		}

		// Retrieve proeject name <--> PolicyID match
		const project = await mulaFN.download(`${mulaFN.jpgPolicyLookupAPI}${projectName}&size=500`, 'project');
		// FIXME: Catch "if false"
		
		// Get CNFT Project Image
		const imgURL = await mulaFN.download(`${mulaFN.opencnftPolicyAPI}${project.policyID}`, 'thumbnail');

		// Retrieve floor
		const jpgFloorJ = await mulaFN.download (`${mulaFN.jpgCollectionAPI}${project.policyID}/floor`, 'data');
		const hypeMultipler = Math.round(Math.random() * (15 - 1 + 1) +1)
    let floorPrice;
    floorPrice = hypeMultipler === 1 ? 'WAIT- NO HYPE! Your shit is at ₳8 rugpull status.' : String((jpgFloorJ.floor / 1000000) * hypeMultipler);

		const msgPayload = {
			title : 'HYPE Floor',
			source : 'jpg',
			header : project.properName,
			content : `Floor price: **₳${floorPrice}**
			[jpg.store link](${mulaFN.jpgStoreLink}${project.name})`,
			thumbnail : `${mulaFN.ipfsBase}${imgURL}`
		}
		const embed = await mulaFN.createMsg(msgPayload);
		await interaction.reply({ embeds: [ embed ] });
	},
};