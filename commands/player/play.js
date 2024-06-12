const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('play')
			.setDescription('Play a song from YouTube').addStringOption(option =>
                option.setName('link').setDescription('YouTube Link').setRequired(true)
            ),

		async execute(interaction) {
			
            const channel = interaction.member?.voice.channel;
            if (channel) {
                // The user is in a voice channel, try to connect.
                try {
                    const url = interaction.options.getString('link');

                    let regex = /(\/watch\?v=[^&]*)|(youtu\.be\/[^?]*)/.exec(url);
                    

                    let id = regex[0].substring(9);

                    console.log(id);

                    const videos = await client.youtube.getVideo(id);

                    try{
                        await client.playSong(url);
                    } catch (error) {
                        //throw error;
                        await interaction.reply('Invalid URL');
                        return;
                    }
                    client.player.unpause();

                    const connection = await client.connectToChannel(channel);

                    connection.on('stateChange', (oldState, newState) => {
                        console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
                    });
                    connection.subscribe(client.player);
                    
                    const songEmbed = new EmbedBuilder()
                        .setColor(0xFFB7C5)
                        .setTitle(videos.title)
                        .setURL("https://www.youtube.com/watch?v=" + videos.id)
                        .setDescription( videos.channel.name )
                        .setImage(videos.thumbnails.best );

                    
                    await interaction.reply("**Playing Now:**");
                    interaction.channel.send({ embeds: [songEmbed] });
                } catch (error) {
                    // Unable to connect to the voice channel within 30 seconds :(
                    console.error(error);
                }
            } else {
                // The user is not in a voice channel.
                void interaction.reply('Join a voice channel then try again!');
            }
		},
	}
};