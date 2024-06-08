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
  new SlashCommandBuilder().setName('start-quiz').setDescription('Starts a music quiz').addStringOption(option =>
    option.setName('playlist').setDescription('YouTube Playlist ID for Music Quiz')
  ),
  new SlashCommandBuilder().setName('end-quiz').setDescription('Ends the current music quiz'),
  new SlashCommandBuilder().setName('skip').setDescription('Skips the current song playing'),
  new SlashCommandBuilder().setName('playlist').setDescription('Sets the playlist to take songs from').addStringOption(option =>
    option.setName('id').setDescription('YouTube Playlist ID').setRequired(true)
  ),
  new SlashCommandBuilder().setName('quiz-length').setDescription('Sets the length of songs the music quiz is'),

  // Music Player Commands
  new SlashCommandBuilder().setName('panini').setDescription('panini'),
  new SlashCommandBuilder().setName('play').setDescription('Play a song from YouTube').addStringOption(option =>
    option.setName('link').setDescription('YouTube Link').setRequired(true)
  ),
  new SlashCommandBuilder().setName('stop').setDescription('Stops/Pauses the current song'),
  new SlashCommandBuilder().setName('resume').setDescription('Resumes the current song in queue'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);