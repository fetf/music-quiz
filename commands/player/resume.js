const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = () => {
	return {
		data: new SlashCommandBuilder()
			.setName('resume')
			.setDescription('Resumes the current song in queue'),

		async execute(interaction) {
			try{
                client.player.unpause();
                client.currTimer.resume();
            } catch {}
            await interaction.reply('Resumed!');
		},
	}
};