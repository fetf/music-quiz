const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { clientId, token } = require('./config.json');

const commands = [
  // Utility Commands
  new SlashCommandBuilder().setName('ping').setDescription('pong!'),

  // Music Quiz Commands
  new SlashCommandBuilder().setName('start-quiz').setDescription('Starts a music quiz').addStringOption(option =>
    option.setName('playlist').setDescription('YouTube Playlist ID for Music Quiz')
  ).addIntegerOption(option =>
    option.setName('length').setDescription('Number of songs in Music Quiz')
  ),
  new SlashCommandBuilder().setName('end-quiz').setDescription('Ends the current music quiz'),
  new SlashCommandBuilder().setName('skip').setDescription('Skips the current song playing'),
  new SlashCommandBuilder().setName('playlist').setDescription('Sets the playlist to take songs from').addStringOption(option =>
    option.setName('id').setDescription('YouTube Playlist ID').setRequired(true)
  ),

  // Music Player Commands
  new SlashCommandBuilder().setName('panini').setDescription('panini'),
  new SlashCommandBuilder().setName('play').setDescription('Play a song from YouTube').addStringOption(option =>
    option.setName('link').setDescription('YouTube Link').setRequired(true)
  ),
  new SlashCommandBuilder().setName('search').setDescription('Search for and play a video from YouTube').addStringOption(option =>
    option.setName('query').setDescription('YouTube Search Query').setRequired(true)
  ),
  new SlashCommandBuilder().setName('stop').setDescription('Stops/Pauses the current song'),
  new SlashCommandBuilder().setName('resume').setDescription('Resumes the current song in queue'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

// rest.put(Routes.applicationCommands(clientId), { body: [] })
// 	.then(() => console.log('Successfully deleted all application commands.'))
// 	.catch(console.error);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);