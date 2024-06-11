const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('skip')
			.setDescription('Skips the current song playing'),

		async execute(interaction) {
			try{
                await client.currTimer.finish();
                await interaction.reply('Skipped!');
            } catch {
                await interaction.reply('Nothing to Skip');
            }
		},
	}
};