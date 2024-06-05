const { Client, Intents } = require('discord.js');
const { guildId, token } = require('./config.json');
const { VoiceConnectionStatus, AudioPlayerStatus, joinVoiceChannel } = require('@discordjs/voice');


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
})


const connection = joinVoiceChannel({
	channelId: "1189702143087751169",
	guildId: guildId,
	adapterCreator: channel.guild.voiceAdapterCreator,
});


/*
connection.on('stateChange', (oldState, newState) => {
	console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
});

player.on('stateChange', (oldState, newState) => {
	console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
});
*/

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'hello') {
		await interaction.reply('World.');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	}
});

client.login(token);
