const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = (client) => {
	return {
		data: new SlashCommandBuilder()
			.setName('search')
			.setDescription('Search for and play a video from YouTube').addStringOption(option =>
                option.setName('query').setDescription('YouTube Search Query').setRequired(true)
            ),

		async execute(interaction) {
			
            const channel = interaction.member?.voice.channel;
            if (channel) {
                /**
                 * The user is in a voice channel, try to connect.
                 */
                try {
                    let inst = client.getInstance(interaction.guildId)
                    const videos = await client.youtube.search(interaction.options.getString('query'), {type: "video"});

                    
                    try{
                        await client.playSong("https://www.youtube.com/watch?v=" + videos.items[0].id, inst);
                    } catch {
                        await interaction.reply('Invalid Query');
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
                        .setTitle(videos.items[0].title)
                        .setURL("https://www.youtube.com/watch?v=" + videos.items[0].id)
                        .setDescription( videos.items[0].channel.name )
                        .setImage(videos.items[0].thumbnails[0].url);
                    
                    await interaction.reply({ content: "**Playing Now:**", embeds: [songEmbed] });
                    
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