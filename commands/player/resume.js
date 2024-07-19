const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('resume')
			.setDescription('Resumes the current song in queue'),

		async execute(interaction) {
			try{
				let inst = client.getInstance(interaction.guildId)
                inst.player.unpause();
                inst.currTimer.resume();
            } catch {}
            await interaction.reply('Resumed!');
		},
	}
};