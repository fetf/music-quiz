const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('search')
			.setDescription('Search for and play a video from YouTube').addStringOption(option =>
                option.setName('query').setDescription('YouTube Search Query').setRequired(true)
            ),

		async execute(interaction) {
			client.player.unpause();
            const channel = interaction.member?.voice.channel;
            if (channel) {
                /**
                 * The user is in a voice channel, try to connect.
                 */
                try {
                    const videos = await client.youtube.search(interaction.options.getString('query'), {type: "video"});
                    
                    try{
                        await client.playSong("https://www.youtube.com/watch?v=" + videos.items[0].id);
                    } catch {
                        await interaction.reply('Invalid URL');
                        return;
                    }


                    const connection = await client.connectToChannel(channel);

                    connection.on('stateChange', (oldState, newState) => {
                        console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
                    });

                    connection.subscribe(client.player);

                    const songEmbed = new EmbedBuilder()
                        .setColor(0xFFB7C5)
                        .setTitle(videos.items[0].title)
                        .setURL("https://www.youtube.com/watch?v=" + videos.items[0].id)
                        .setDescription( videos.items[0].channel.name )
                        .setImage(videos.items[0].thumbnails[0].url);
                    
                    await interaction.reply("**Playing Now:**");
                    interaction.channel.send({ embeds: [songEmbed] });
                    
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
		},
	}
};