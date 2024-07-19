const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('stop')
			.setDescription('Stops/Pauses the current song'),

		async execute(interaction) {
			try{
				let inst = client.getInstance(interaction.guildId)
                inst.player.pause();
                inst.currTimer.pause();
            } catch {}
            await interaction.reply('Stopped!');
		},
	}
};