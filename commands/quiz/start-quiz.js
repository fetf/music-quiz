const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('start-quiz')
			.setDescription('Starts the Quiz')
			.addStringOption(option =>
				option.setName('playlist').setDescription('YouTube Playlist ID for Music Quiz').setRequired(true)
			).addIntegerOption(option =>
				option.setName('length').setDescription('Number of songs in Music Quiz')
			),

		async execute(interaction) {
			if (!client.activeQuiz) {
				client.player.unpause();
				const channel = interaction.member?.voice.channel;
				if (channel) {
					/**
					 * The user is in a voice channel, try to connect.
					 */
					try {
						const playlistId = interaction.options.getString('playlist');
						
						const playlist = await client.youtube.getPlaylist(playlistId);
	
						let maxVideos = interaction.options.getInteger('length');
						if(!Number.isInteger(maxVideos) || maxVideos > playlist.videos.items.length || maxVideos <= 0){
							maxVideos = playlist.videos.items.length;
						}
	
						let videos = playlist.videos.items.slice(0, maxVideos);
						client.shuffle(videos);
	
						try{
							await client.playSongList(videos, 0, interaction.channel);
						} catch (error) {
							console.error(error);
							await interaction.reply('Invalid Playlist');
							return;
						}
	
	
						const connection = await client.connectToChannel(channel);
	
						connection.on('stateChange', (oldState, newState) => {
							console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
						});
						/**
						 * We have successfully connected! Now we can subscribe our connection to
						 * the player. This means that the player will play audio in the user's
						 * voice channel.
						 */
						connection.subscribe(client.player);
						
						const message = await interaction.reply({ content: 'Music Quiz Started!', fetchReply: true });
						client.activeQuiz = true;
						client.channelId = interaction.channelId;
						message.react('😄');
						for (let id of channel.members.keys()) {
							if (!channel.members.get(id).user.bot) {
								client.scores.set(id, 0);
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
		},
	}
};