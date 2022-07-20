const { SlashCommandBuilder } = require('@discordjs/builders');
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hypefloor')
		.setDescription('When you need to feel really really good')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project').toLowerCase();

		// shortcut check
		if (projectName in mulaFN.SHORTCUTS) {
			projectName = mulaFN.SHORTCUTS[projectName];
		}

		// Retrieve proeject name <--> PolicyID match
		const project = await mulaFN.download(projectName, 'project');
		if (project === "error") {
			console.error(`ERROR: Command: Floor - ${projectName}`);
			return await interaction.reply(`I couldn't find ${projectName} -- Typo maybe? Dum dum.`);
		}
		// FIXME: Catch "if false"
		
		// Get CNFT Project Image
		const imgURL = await mulaFN.download(`${mulaFN.opencnftPolicyAPI}${project.policy_id}`, 'thumbnail');

		// Retrieve floor
		const jpgFloorJ = await mulaFN.download (`${mulaFN.jpgCollectionAPI}${project.policy_id}/floor`, 'data');
		const hypeMultipler = Math.round(Math.random() * (15 - 1 + 1) +1)
    let floorPrice;
    floorPrice = hypeMultipler === 1 ? 'WAIT- NO HYPE! Your shit is at ₳8 rugpull status.' : String((jpgFloorJ.floor / 1000000) * hypeMultipler);

		const msgPayload = {
			title : 'HYPE Floor',
			source : 'jpg',
			header : project.display_name,
			content : `Floor price: **₳${floorPrice}**
			[jpg.store link](${mulaFN.jpgStoreLink}${project.url})`,
			thumbnail : `${mulaFN.ipfsBase}${imgURL}`
		}
		const embed = await mulaFN.createMsg(msgPayload);
		console.log(`Command: HypeFloor - ${project.display_name}`)
		await interaction.reply({ embeds: [ embed ] });
	},
};