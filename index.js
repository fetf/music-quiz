const fs = require('fs');
const path = require('path');
const ytdl = require("@distube/ytdl-core");
const Mutex = require('async-mutex').Mutex;
const { Client, Collection, EmbedBuilder } = require('discord.js');
const { GatewayIntentBits } = require("discord-api-types/v10");
const { stringSimilarity } = require("string-similarity-js");
const { Client:YTClient, MusicClient } = require("youtubei");
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
} = require('@discordjs/voice');
const { token } = require('./config.json');

class Queue {
	constructor() {
		this.items = [];
	}

	enqueue(element) {
		this.items.push(element);
	}

	dequeue() {
		if (this.isEmpty()) {
			return null;
		}
		return this.items.shift();
	}

	isEmpty() {
		return this.items.length === 0;
	}

	peek() {
		if (this.isEmpty()) return null;
		return this.items[0];
	}

	size() {
		return this.items.length;
	}

	clear() {
		this.items = [];
	}
}

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
	],
});
client.youtube = new YTClient();

const music = new MusicClient();
const mutex = new Mutex();
const queue = new Queue();

const regexFt = /^(.+?)\s*\((.*)\)$/;
const regexAlphanumeric = /[a-zA-Z0-9]+/g;
let hasFtT = false; // if the title has parentheses
let hasFtA = false; // if the artist has parentheses
let has2ndTitle = false;
let titleNoFt;
let artistNoFt;
let alphanumericTitle;
let secondTitle;
let youtubeTitle;
let song;
let artist;
let songGuessed = false;
let artistGuessed = false;

client.player = createAudioPlayer();
client.player.on('stateChange', (oldState, newState) => {
	console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
});

client.playSong = function(url) {
	const stream = ytdl(url, {filter: 'audioonly'});
	const resource = createAudioResource(stream);
	client.player.play(resource);
	return entersState(client.player, AudioPlayerStatus.Playing, 5000);
}

client.Timer = function(callback, delay, p1, p2, p3) {
	let timerId, start, remaining = delay;

	this.pause = function() {
		clearTimeout(timerId);
		timerId = null;
		remaining -= Date.now() - start;
	};

	this.finish = async function() {
		clearTimeout(timerId);
		await client.playSongList(p1, p2, p3);
	}

	this.resume = function() {
		if (timerId) {
			return;
		}

		start = Date.now();
		timerId = setTimeout(callback, remaining, p1, p2, p3);
	};

	this.resume();
};

client.connectToChannel = async function(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	})

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection
	} catch (error) {
		connection.destroy()
		throw error
	}
}

client.playSongList = async function(videos, index, channel) {
	await mutex.acquire(); //console.log("play aquired");

	if(index > 0){
		const scoresString = Array.from(client.scores.entries()).map(([userId, score]) => `<@${userId}>: ${score}`).join('\n');
		const songEmbed = new EmbedBuilder()
			.setColor(0xFFB7C5)
			.setTitle(song)
			.setAuthor({ name: 'Music Quiz: Song #' + index.toString()})
			.setDescription( artist )
			.addFields(
				{ name: 'Placements', value: scoresString }
			)
			.setImage(videos[index-1].thumbnails[0].url);

		
		channel.send({ embeds: [songEmbed] });
	}

	if(videos.length == index){
		client.player.pause();
		const scoresString = Array.from(client.scores.entries()).map(([userId, score]) => `<@${userId}>: ${score}`).join('\n');
		const overEmbed = new EmbedBuilder()
			.setColor(0xFFB7C5)
			.setTitle("Music Quiz Final Score:")
			.addFields(
				{ name: 'Placements', value: scoresString }
			)
		
		channel.send({ embeds: [overEmbed] });
		client.activeQuiz = false;
		client.scores.clear();
		//channel.send("Quiz Over");
		return;
	}

	
	let start = videos[index].duration - 30;
	if(start < 0) start = 0;
	start = Math.floor(Math.random() * (start+1));
	console.log("start at " + start.toString());
	

	const stream = ytdl("https://www.youtube.com/watch?v=" + videos[index].id, { quality :"highestvideo", begin: start.toString() + "s", filter: "audioandvideo" });
	const resource = createAudioResource(stream);
	/**
	 * We will now play this to the audio player. By default, the audio player will not play until
	 * at least one voice connection is subscribed to it, so it is fine to attach our resource to the
	 * audio player this early.
	 */
	let songM = await music.search(videos[index].title + " " + videos[index].channel.name, "song");
	//console.log('Searching: ' + search);

	let itemToUse = songM.items[0];
	let bestSimilar = 0;
	for(let j = 0; j<songM.items.length; j++){
		let similar = stringSimilarity(songM.items[j].title.toLowerCase(), videos[index].title.toLowerCase());
		if(similar > bestSimilar){
			itemToUse = songM.items[j];
			bestSimilar = similar;
		}
	}
	
	song = itemToUse.title;
	youtubeTitle = videos[index].title.toLowerCase();
	console.log('YouTube Title: ' + youtubeTitle);
	artist = songM.items[0].artists[0].name;
	hasFtT = regexFt.test(song);
	hasFtA = regexFt.test(artist);
	alphanumericTitle = song.match(regexAlphanumeric).join(' ').toLowerCase();
	if (hasFtT) {
		const match = song.match(regexFt);
		titleNoFt = match[1].toLowerCase();
		const secondMatch = match[2].toLowerCase();
		if (!(secondMatch.includes('feat') || secondMatch.includes('from') || secondMatch.includes('edit') || secondMatch.includes('live'))) {
			has2ndTitle = true;
			secondTitle = secondMatch;
		}
	};
	if (hasFtA) {
		const match = artist.match(regexFt);
		artistNoFt = match[1].toLowerCase();
	};
	songGuessed = false;
	artistGuessed = false;
	console.log(song);
	console.log(artist);
	mutex.release(); //console.log("play released");

	client.player.play(resource);

	/**
	 * Here we are using a helper function. It will resolve if the player enters the Playing
	 * state within 5 seconds, otherwise it will reject with an error.
	 */
	//currTimeoutID = setTimeout(playSongList, 15000, videos, index+1, channel);
	client.currTimer = new client.Timer(client.playSongList, 30000, videos, index+1, channel);
	return entersState(client.player, AudioPlayerStatus.Playing, 5000);


}

client.shuffle = function(array) {
	// Fisher-Yates
	let currentIndex = array.length;

	while (currentIndex !== 0) {
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
}

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.activeQuiz = false;
	songGuessed = false;
	artistGuessed = false;
	client.scores = new Map();
});


client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const commandFunction = require(filePath);
		const command = commandFunction(client);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on('messageCreate', async message => {
	function correctSong() {
		songGuessed = true;
		message.react('✅');
		client.scores.set(message.author.id, client.scores.get(message.author.id) + 1);
		console.log(client.scores);
	};
	function correctArtist() {
		artistGuessed = true;
		message.react('✅');
		client.scores.set(message.author.id, client.scores.get(message.author.id) + 1);
		console.log(client.scores);
	};
	await mutex.acquire();
	if (client.activeQuiz && client.channelId === message.channelId) {
		if (message.author.bot) {
			mutex.release();
			return;
		}
		const content = message.content.toLowerCase();
		if (!client.scores.has(message.author.id)) { client.scores.set(message.author.id, 0); }
		if (!songGuessed && stringSimilarity(content, song.toLowerCase(), 1) > 0.85) {
			correctSong();
		} else if (!songGuessed && hasFtT && stringSimilarity(content, titleNoFt, 1) > 0.85) {
			correctSong();
		} else if (!songGuessed && stringSimilarity(content, youtubeTitle, 1) > 0.85) {
			correctSong();
		} else if (!songGuessed && stringSimilarity(content, alphanumericTitle, 1) > 0.85) {
			correctSong();
		} else if (!songGuessed && has2ndTitle && stringSimilarity(content, secondTitle, 1) > 0.85) {
			correctSong();
		} else if (!artistGuessed && stringSimilarity(content, artist.toLowerCase(), 1) > 0.85) {
			correctArtist();
		} else if (!artistGuessed && hasFtA && stringSimilarity(content, artistNoFt, 1) > 0.85) {
			correctArtist();
		} else {
			message.react('❌');
		}
		if(songGuessed && artistGuessed){
			mutex.release();
			await client.currTimer.finish();
		}
	}
	mutex.release();
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	console.log(commandName);

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(token);
