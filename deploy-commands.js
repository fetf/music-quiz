const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const commands = [
  // General Commands
  new SlashCommandBuilder().setName('hello').setDescription('Says hello or something'),
  new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
  new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
  new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
 
  // Music Quiz Commands
  new SlashCommandBuilder().setName('start-quiz').setDescription('Starts a music quiz'),
  new SlashCommandBuilder().setName('end-quiz').setDescription('Ends the current music quiz'),
  new SlashCommandBuilder().setName('skip').setDescription('Skips the current song playing'),
  new SlashCommandBuilder().setName('playlist').setDescription('Sets the playlist to take songs from'),
  new SlashCommandBuilder().setName('quiz-length').setDescription('Sets the length of songs the music quiz is'),

  new SlashCommandBuilder().setName('panini').setDescription('panini'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
