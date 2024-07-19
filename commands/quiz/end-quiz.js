
const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('end-quiz')
			.setDescription('Ends the current music quiz'),

		async execute(interaction) {
			let inst = client.getInstance(interaction.guildId)
			if (inst.activeQuiz) {
				const message = await interaction.reply({ content: 'Music Quiz Ended!', fetchReply: true });
				inst.activeQuiz = false;
				inst.player.pause();
				inst.currTimer.pause();
				const scoresString = Array.from(inst.scores.entries()).map(([userId, score]) => `<@${userId}>: ${score}`).join('\n');
				const overEmbed = new EmbedBuilder()
					.setColor(0xFFB7C5)
					.setTitle("Music Quiz Final Score:")
					.addFields(
						{ name: 'Placements', value: scoresString }
					)

				message.channel.send({ embeds: [overEmbed] });
				message.react('😭');
				inst.scores.clear();
			} else {
				await interaction.reply('Music Quiz not started');
			}
		},
	}
};