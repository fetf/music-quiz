const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('end-quiz')
		.setDescription('Ends the Quiz'),

	async execute(interaction) {
        if (global.activeQuiz) {
		    const message = await interaction.reply({ content: 'Music Quiz Ended!', fetchReply: true });
            global.activeQuiz = false;
		    message.react('😭');
        } else {
            await interaction.reply('Music Quiz not started');
        }
	},
};