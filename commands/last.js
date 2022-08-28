const { SlashCommandBuilder } = require('discord.js');
const ordinal = require('ordinal')
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
const mulaFN = require('../mula_functions');
const api = require('../config/api');
dayjs.extend(relativeTime);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('last')
		.setDescription('Retrieve the last # sales made')
		.addStringOption(option => option.setName('project').setDescription('Enter a project name').setRequired(true))
		.addIntegerOption(option => option.setName('amount').setDescription('Retrieve the last # sales made').setMinValue(1).setMaxValue(20)),
	async execute(interaction) {
		let projectName = interaction.options.getString('project');
		projectName = await mulaFN.shortcutCheck(projectName);

		let amount = interaction.options.getInteger('amount');
		amount > 0 ? {} : amount = 5;

		// Retrieve project name <--> PolicyID match
		const project = await mulaFN.download(projectName, 'project')
		if (project === "error") return ['error', projectName];

		// Get CNFT Project Image
		const imgURL = await mulaFN.download(`${api.opencnftPolicy}${project.policy_id}`, 'thumbnail');


		// Retrieve recent sales
		const jpgSalesJ = await mulaFN.download(`${api.jpgProject}${project.policy_id}/sales?page=1`, 'data');
		const jpgSalesData = jpgSalesJ.slice(0, amount);

		// Preparing the message content
		function saleMsg(sale) {
			let msg = ''
			for (let i = 0; i < sale.length; i += 1) {
				msg += `**${ordinal(i + 1)}** ${sale[i].display_name} **:** Price: ₳**${Number(sale[i].price_lovelace / 1000000)}** - Purchased: **${dayjs(sale[i].confirmed_at).fromNow()}**\n`
			}
			return msg;
		}

		const msgPayload = {
			title: 'Last',
			source: 'jpg',
			header: project.display_name,
			content: saleMsg(jpgSalesData),
			thumbnail: `${api.ipfsBase}${imgURL}`
		}

		const embed = await mulaFN.createMsg(msgPayload);

		await interaction.editReply({
			embeds: [embed]
		});
		return project.display_name;
	},
};