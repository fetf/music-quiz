const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = () => {
	return {
		data: new SlashCommandBuilder()
			.setName('ping')
			.setDescription('Ping the bot'),

		async execute(interaction) {
			await interaction.reply('Pong!');
		},
	}
};