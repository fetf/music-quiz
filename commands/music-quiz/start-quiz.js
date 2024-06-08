const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-quiz')
		.setDescription('Starts the Quiz'),

	async execute(interaction) {
        if (!global.activeQuiz) {
		    const message = await interaction.reply({ content: 'Music Quiz Started!', fetchReply: true });
            global.activeQuiz = true;
            global.channelId = interaction.channelId;
		    message.react('😄');
        } else {
            await interaction.reply('Music Quiz already started');
        }
	},
};