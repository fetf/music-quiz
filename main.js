const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	StreamType,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	NoSubscriberBehavior 
} = require('@discordjs/voice');
const { GatewayIntentBits } = require("discord-api-types/v10")
const { Client, EmbedBuilder } = require("discord.js");
const ytdl = require('ytdl-core');
const { Client:Client2 } = require("youtubei");
const { stringSimilarity } = require("string-similarity-js");



const { token } = require("./config.json")

/**
 * 	In this example, we are creating a single audio player that plays to a number of voice channels.
 * The audio player will play a single track.
 */

/**
 * Create the audio player. We will use this for all of our connections.
 */
const player = createAudioPlayer();

const youtube = new Client2();

player.on('stateChange', (oldState, newState) => {
console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
});

function playSong(url) {
	/**
	 * Here we are creating an audio resource using a sample song freely available online
	 * (see https://www.soundhelix.com/audio-examples)
	 *
	 * We specify an arbitrary inputType. This means that we aren't too sure what the format of
	 * the input is, and that we'd like to have this converted into a format we can use. If we
	 * were using an Ogg or WebM source, then we could change this value. However, for now we
	 * will leave this as arbitrary.
	 */



	//const url = 'https://www.youtube.com/watch?v=hUE2DuMP9y8&pp=ygUXcGFuaW5pIGxpbCBuYXMgeCBkYWJhYnk%3D'


	const stream = ytdl(url, {filter: 'audioonly'});
	const resource = createAudioResource(stream);
	/**
	 * We will now play this to the audio player. By default, the audio player will not play until
	 * at least one voice connection is subscribed to it, so it is fine to attach our resource to the
	 * audio player this early.
	 */
	player.play(resource)

	/**
	 * Here we are using a helper function. It will resolve if the player enters the Playing
	 * state within 5 seconds, otherwise it will reject with an error.
	 */
	return entersState(player, AudioPlayerStatus.Playing, 5000);
}

let currTimer;


const Timer = function(callback, delay, p1, p2, p3) {
	let timerId, start, remaining = delay;

	this.pause = function() {
		clearTimeout(timerId);
		timerId = null;
		remaining -= Date.now() - start;
	};

	this.finish = function() {
		clearTimeout(timerId);
		playSongList(p1, p2, p3);
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

function playSongList(videos, index, channel) {
/**
 * Here we are creating an audio resource using a sample song freely available online
 * (see https://www.soundhelix.com/audio-examples)
 *
 * We specify an arbitrary inputType. This means that we aren't too sure what the format of
 * the input is, and that we'd like to have this converted into a format we can use. If we
 * were using an Ogg or WebM source, then we could change this value. However, for now we
 * will leave this as arbitrary.
 */	



	if(index > 0){
		const scoresString = Array.from(global.scores.entries()).map(([userId, score]) => `<@${userId}>: ${score}`).join(', ');
		const songEmbed = new EmbedBuilder()
			.setColor(0xFFB7C5)
			.setTitle(videos[index-1].title)
			.setAuthor({ name: 'Music Quiz: Song #' + index.toString()})
			.setDescription( videos[index-1].channel.name )
			.addFields(
				{ name: 'Placements', value: scoresString }
			)
			.setImage(videos[index-1].thumbnails[0].url);

		
		channel.send({ embeds: [songEmbed] });
	}

	if(videos.length == index){
		player.pause();
		const scoresString = Array.from(global.scores.entries()).map(([userId, score]) => `<@${userId}>: ${score}`).join(', ');
		const overEmbed = new EmbedBuilder()
			.setColor(0xFFB7C5)
			.setTitle("Music Quiz Final Score:")
			.addFields(
				{ name: 'Placements', value: scoresString }
			)

		
		channel.send({ embeds: [overEmbed] });
		//channel.send("Quiz Over");
		return;
	}

	/*
	let start = videos[index].duration - 30;
	if(start < 0) start = 0;
	start = Math.floor(Math.random() * (start+1));
	console.log("start at " + start.toString());
	*/

	const stream = ytdl("https://www.youtube.com/watch?v=" + videos[index].id, { filter:"audioonly" });
	const resource = createAudioResource(stream);
	/**
	 * We will now play this to the audio player. By default, the audio player will not play until
	 * at least one voice connection is subscribed to it, so it is fine to attach our resource to the
	 * audio player this early.
	 */
	
	global.song = videos[index].title;
	global.artist = videos[index].channel.name;
	global.songGuessed = false;
	global.artistGuessed = false;
	console.log(global.song);
	console.log(global.artist);
	player.play(resource);

	/**
	 * Here we are using a helper function. It will resolve if the player enters the Playing
	 * state within 5 seconds, otherwise it will reject with an error.
	 */
	//currTimeoutID = setTimeout(playSongList, 15000, videos, index+1, channel);
	currTimer = new Timer(playSongList, 30000, videos, index+1, channel);
	return entersState(player, AudioPlayerStatus.Playing, 5000);


}

function shuffle(array) {
	let currentIndex = array.length;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {

		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
		array[randomIndex], array[currentIndex]];
	}
}


async function connectToChannel(channel) {
	/**
	 * Here, we try to establish a connection to a voice channel. If we're already connected
	 * to this voice channel, @discordjs/voice will just return the existing connection for us!
	 */
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	})

	/**
	 * If we're dealing with a connection that isn't yet Ready, we can set a reasonable
	 * time limit before giving up. In this example, we give the voice connection 30 seconds
	 * to enter the ready state before giving up.
	 */
	try {
		/**
		 * Allow ourselves 30 seconds to join the voice channel. If we do not join within then,
		 * an error is thrown.
		 */
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		/**
		 * At this point, the voice connection is ready within 30 seconds! This means we can
		 * start playing audio in the voice channel. We return the connection so it can be
		 * used by the caller.
		 */
		return connection
	} catch (error) {
		/**
		 * At this point, the voice connection has not entered the Ready state. We should make
		 * sure to destroy it, and propagate the error by throwing it, so that the calling function
		 * is aware that we failed to connect to the channel.
		 */
		connection.destroy()
		throw error
	}
}

/**
 * Main code
 * =========
 * Here we will implement the helper functions that we have defined above.
 */

const client = new Client({
intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.MessageContent,
]
})


client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	global.activeQuiz = false;
	global.songGuessed = false;
	global.artistGuessed = false;
	global.scores = new Map();
});


client.on('messageCreate', async message => {
	if (global.activeQuiz && global.channelId === message.channelId) {
		if (message.author.bot) return;
		const content = message.content.toLowerCase();
		if (!global.songGuessed && stringSimilarity(content, global.song.toLowerCase(), 1) > 0.9) {
			global.songGuessed = true;
			message.react('✅');
			global.scores.set(message.author.id, global.scores.get(message.author.id) + 1);
			console.log(global.scores);
		} else if (!global.artistGuessed && stringSimilarity(content, global.artist.toLowerCase(), 1) > 0.9) {
			global.artistGuessed = true;
			message.react('✅');
			global.scores.set(message.author.id, global.scores.get(message.author.id) + 1);
			console.log(global.scores);
		} else {
			message.react('❌');
		}
		if(global.songGuessed && global.artistGuessed){
			currTimer.finish();
		}
	}
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;
	const { commandName } = interaction;
	if (commandName === 'panini') {
		player.unpause();
		const channel = interaction.member?.voice.channel;
		if (channel) {
			/**
			 * The user is in a voice channel, try to connect.
			 */
			try {
				const url = "https://www.youtube.com/watch?v=hUE2DuMP9y8&pp=ygUXcGFuaW5pIGxpbCBuYXMgeCBkYWJhYnk%3D";
				await playSong(url);
				

				const connection = await connectToChannel(channel);

				connection.on('stateChange', (oldState, newState) => {
					console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
				});
				/**
				 * We have successfully connected! Now we can subscribe our connection to
				 * the player. This means that the player will play audio in the user's
				 * voice channel.
				 */
				connection.subscribe(player);
				
				await interaction.reply('Playing now!');
			} catch (error) {
				/**
				 * Unable to connect to the voice channel within 30 seconds :(
				 */
				console.error(error);
			}
		} else {
			/**
			 * The user is not in a voice channel.
			 */
			void interaction.reply('Join a voice channel then try again!');
		}
	} 

	if (commandName === 'start-quiz') {
		if (!global.activeQuiz) {
			player.unpause();
			const channel = interaction.member?.voice.channel;
			if (channel) {
				/**
				 * The user is in a voice channel, try to connect.
				 */
				try {
					const playlistId = interaction.options.getString('playlist');
					
					const playlist = await youtube.getPlaylist(playlistId);

					let videos = playlist.videos.items.slice();
					shuffle(videos);

					try{
						await playSongList(videos, 0, interaction.channel);
					} catch (error) {
						console.error(error);
						await interaction.reply('Invalid Playlist');
						return;
					}


					const connection = await connectToChannel(channel);

					connection.on('stateChange', (oldState, newState) => {
						console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
					});
					/**
					 * We have successfully connected! Now we can subscribe our connection to
					 * the player. This means that the player will play audio in the user's
					 * voice channel.
					 */
					connection.subscribe(player);
					
					const message = await interaction.reply({ content: 'Music Quiz Started!', fetchReply: true });
					global.activeQuiz = true;
					global.channelId = interaction.channelId;
					message.react('😄');
					for (let id of channel.members.keys()) {
						if (!channel.members.get(id).user.bot) {
							global.scores.set(id, 0);
						}
					}
				} catch (error) {
					/**
					 * Unable to connect to the voice channel within 30 seconds :(
					 */
					console.error(error);
				}
			} else {
				/**
				 * The user is not in a voice channel.
				 */
				void interaction.reply('Join a voice channel then try again!');
			}
		} else {
            await interaction.reply('Music Quiz already started');
        }
	} 

	if (commandName === 'end-quiz') {
		if (global.activeQuiz) {
		    const message = await interaction.reply({ content: 'Music Quiz Ended!', fetchReply: true });
            global.activeQuiz = false;
		    message.react('😭');
        } else {
            await interaction.reply('Music Quiz not started');
        }
	}

	if (commandName === 'play') {
		player.unpause();
		const channel = interaction.member?.voice.channel;
		if (channel) {
			/**
			 * The user is in a voice channel, try to connect.
			 */
			try {
				const url = interaction.options.getString('link');
				
				try{
					await playSong(url);
				} catch {
					await interaction.reply('Invalid URL');
					return;
				}


				const connection = await connectToChannel(channel);

				connection.on('stateChange', (oldState, newState) => {
					console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
				});
				/**
				 * We have successfully connected! Now we can subscribe our connection to
				 * the player. This means that the player will play audio in the user's
				 * voice channel.
				 */
				connection.subscribe(player);
				
				await interaction.reply('Playing now!');
			} catch (error) {
				/**
				 * Unable to connect to the voice channel within 30 seconds :(
				 */
				console.error(error);
			}
		} else {
			/**
			 * The user is not in a voice channel.
			 */
			void interaction.reply('Join a voice channel then try again!');
		}

	}

	if (commandName === 'stop') {
		try{
			player.pause();
			currTimer.pause();
		}catch{}
		await interaction.reply('Stopped!');
	}
	if (commandName === 'skip') {
		try{
			currTimer.finish();
			await interaction.reply('Skipped!');
		}catch{
			await interaction.reply('Nothing to Skip');
		}
		
	}
	if(commandName === 'resume'){
		try{
			player.unpause();
			currTimer.resume();
		} catch{}
		await interaction.reply('Resumed!');
	}
	if(commandName === 'playlist'){
		player.unpause();
		const channel = interaction.member?.voice.channel;
		if (channel) {
			/**
			 * The user is in a voice channel, try to connect.
			 */
			try {
				const playlistId = interaction.options.getString('id');
				
				const playlist = await youtube.getPlaylist(playlistId);

				/*let videos = new Array(playlist.videos.items.length);

				for(let i = 0; i < playlist.videos.items.length; i++){
					videos[i] = "https://www.youtube.com/watch?v=" + playlist.videos.items[i].id;
				}*/

				let videos = playlist.videos.items.slice();
				shuffle(videos);
				


				try{
					await playSongList(videos, 0, interaction.channel);
				} catch (error) {
					console.error(error);
					await interaction.reply('Invalid Playlist');
					return;
				}


				const connection = await connectToChannel(channel);

				connection.on('stateChange', (oldState, newState) => {
					console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
				});
				/**
				 * We have successfully connected! Now we can subscribe our connection to
				 * the player. This means that the player will play audio in the user's
				 * voice channel.
				 */
				connection.subscribe(player);
				
				await interaction.reply('Playing now!');
			} catch (error) {
				/**
				 * Unable to connect to the voice channel within 30 seconds :(
				 */
				console.error(error);
			}
		} else {
			/**
			 * The user is not in a voice channel.
			 */
			void interaction.reply('Join a voice channel then try again!');
		}


	}

});

void client.login(token);