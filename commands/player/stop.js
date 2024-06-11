const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('stop')
			.setDescription('Stops/Pauses the current song'),

		async execute(interaction) {
			try{
                client.player.pause();
                client.currTimer.pause();
            } catch {}
            await interaction.reply('Stopped!');
		},
	}
};