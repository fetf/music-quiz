const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('play')
			.setDescription('Play a song from YouTube').addStringOption(option =>
                option.setName('link').setDescription('YouTube Link').setRequired(true)
            ),

		async execute(interaction) {
            await interaction.deferReply({ content: 'Searching for song...'});
			
            const channel = interaction.member?.voice.channel;
            if (channel) {
                // The user is in a voice channel, try to connect.
                try {
                    let inst = client.getInstance(interaction.guildId)
                    const url = interaction.options.getString('link');

                    let regex = /(\/watch\?v=[^&]*)|(youtu\.be\/[^?]*)/.exec(url);
                    

                    let id = regex[0].substring(9);

                    console.log(id);

                    const videos = await client.youtube.getVideo(id);

                    try{
                        await client.playSong(url, inst);
                    } catch (error) {
                        //throw error;
                        await interaction.editReply('Invalid URL');
                        return;
                    }
                    inst.player.unpause();

                    const connection = await client.connectToChannel(channel);

                    connection.once('stateChange', (oldState, newState) => {
                        console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
                    });
                    connection.subscribe(inst.player);
                    
                    const songEmbed = new EmbedBuilder()
                        .setColor(0xFFB7C5)
                        .setTitle(videos.title)
                        .setURL("https://www.youtube.com/watch?v=" + videos.id)
                        .setDescription( videos.channel.name )
                        .setImage(videos.thumbnails.best );

                    
                    await interaction.editReply({ content: "**Playing Now:**", embeds: [songEmbed] });
                } catch (error) {
                    // Unable to connect to the voice channel within 30 seconds :(
                    console.error(error);
                    await interaction.editReply('Error connecting to voice.');
                }
            } else {
                // The user is not in a voice channel.
                await interaction.editReply('Join a voice channel then try again!');
            }
		},
	}
};