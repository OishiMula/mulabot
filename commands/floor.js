const { SlashCommandBuilder } = require('@discordjs/builders');
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tfloor')
		.setDescription('Retrieve the floor price')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project').toLowerCase();
		let msgPayload;

		// crew check - fun sayings
		if (projectName in mulaFN.CREW) {
			return await interaction.reply(`${projectName.toProperCase()} - ${mulaFN.choose(mulaFN.CREW[projectName])}`)
		}

		// shortcut check
		if (projectName in mulaFN.SHORTCUTS) {
			projectName = mulaFN.SHORTCUTS[projectName];
		}

		// Retrieve project name <--> PolicyID match
		let project = await mulaFN.download(`${mulaFN.jpgPolicyLookupAPI}${projectName}&size=500`, 'project');
		// FIXME: Catch "if false", but check if Eth
		if (!project) {
			project = await mulaFN.download(`${mulaFN.openSeaAPI}${projectName}`, 'eproject');
			if (!project) {
				// TODO: Error code
				return;
			}
			else {
				// Retrieve the Eth project data
				const projectData = await mulaFN.download(`${mulaFN.openSeaAPI}${projectName}/stats`, 'data');
				const floorPrice = projectData.stats.floor_price;
				msgPayload = {
					title : 'Floor',
					source : 'opensea',
					header : project.name,
					content : `Floor Price: **Ξ${floorPrice}**`,
					thumbnail : project.img
				}
			}
		}

		else {
			// Get CNFT Project Image
			const imgURL = await mulaFN.download(`${mulaFN.opencnftPolicyAPI}${project.policyID}`, 'thumbnail');

			// Retrieve floor
			const jpgFloorJ = await mulaFN.download (`${mulaFN.jpgCollectionAPI}${project.policyID}/floor`, 'data');
			const floorPrice = String(jpgFloorJ.floor / 1000000);

			msgPayload = {
				title : 'Floor',
				source : 'jpg',
				header : project.properName,
				content : `Floor price: **₳${floorPrice}**
				[jpg.store link](${mulaFN.jpgStoreLink}${project.name})`,
				thumbnail : `${mulaFN.ipfsBase}${imgURL}`
			}
		}
		const embed = await mulaFN.createMsg(msgPayload);
		await interaction.reply({ embeds: [ embed ] });
	},
};