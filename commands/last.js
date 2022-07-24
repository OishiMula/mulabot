const {
	SlashCommandBuilder
} = require('@discordjs/builders');
const ordinal = require('ordinal')
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
const mulaFN = require('/home/pi/projects/js/mula_bot/mula_functions.js');
dayjs.extend(relativeTime);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('last')
		.setDescription('Retrieve the last # sales made')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true))
		.addIntegerOption(option => option.setName('amount').setDescription('Retrieve the last # sales made').setMinValue(1).setMaxValue(10)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project');
		// shortcut check
		if (projectName in mulaFN.SHORTCUTS) {
			projectName = mulaFN.SHORTCUTS[projectName];
		}

		let amount = interaction.options.getInteger('amount');
		amount > 0 ? {} : amount = 5;

		// Retrieve proeject name <--> PolicyID match
		const project = await mulaFN.download(projectName, 'project')
		if (project === "error") return ['error', projectName];

		// Get CNFT Project Image
		const imgURL = await mulaFN.download(`${mulaFN.opencnftPolicyAPI}${project.policy_id}`, 'thumbnail');

		// Retrieve recent sales
		// TODO: Add more pages
		const jpgSalesJ = await mulaFN.download(`${mulaFN.jpgPolicyAPI}${project.policy_id}/sales?page=1`, 'data');
		const jpgSalesData = jpgSalesJ.slice(0, amount);

		// Preparing the message content
		function saleMsg(sale) {
			let msg = ''
			for (let i = 0; i < sale.length; i += 1) {
				msg += `**${ordinal(i + 1)}** ${sale[i].display_name} | Price: ₳**${Number(sale[i].price_lovelace / 1000000)}** - Purchased: **${dayjs(sale[i].confirmed_at).fromNow()}**\n`
			}
			return msg;
		}

		const msgPayload = {
			title: 'Last',
			source: 'jpg',
			header: project.display_name,
			content: saleMsg(jpgSalesData),
			thumbnail: `${mulaFN.ipfsBase}${imgURL}`
		}


		const embed = await mulaFN.createMsg(msgPayload);

		await interaction.editReply({
			embeds: [embed]
		});
		return project.display_name;
	},
};