const { Client, Intents, VoiceChannel } = require('discord.js');
const { guildId, token } = require('./config.json');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	StreamType,
	AudioPlayerStatus,
	VoiceConnectionStatus,
} = require('@discordjs/voice');


const { GatewayDispatchEvents } = require("discord-api-types/v10")
const { Constants } = require('discord.js');
const { Events, Status } = Constants



const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	try {
		await playSong();
		console.log('Song is ready to play!');
	} catch (error) {
		console.error(error);
	}
})

const player = createAudioPlayer();


function playSong() {
	const resource = createAudioResource('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', {
		inputType: StreamType.Arbitrary,
	});

	player.play(resource);

	return entersState(player, AudioPlayerStatus.Playing, 5000);
}

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: createDiscordJSAdapter(channel),
	});

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}


client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'hello') {
		await interaction.reply('World.');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	/*} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);*/
	} else if (commandName === 'user') {
		client.channels.fetch("1189702143087751169") // voice channel's id
			.then((channel) => { // channel object

				if (channel) {
					try {

						const connection = joinVoiceChannel({
							channelId: channel.id,
							guildId: channel.guild.id,
							adapterCreator: createDiscordJSAdapter(channel),
						});
					
						try {
							entersState(connection, VoiceConnectionStatus.Ready, 30_000);
						} catch (error) {
							connection.destroy();
							throw error;
						}

						
						connection.subscribe(player);
						interaction.reply('Playing now!');
					} catch (error) {
						console.error(error);
					}
				} else {
					interaction.reply('Join a voice channel then try again!');
				}
			});
	}
});

client.login(token);









const adapters = new Map()
const trackedClients = new Set()
const trackedShards = new Map()

/**
 * Tracks a Discord.js client, listening to VOICE_SERVER_UPDATE and VOICE_STATE_UPDATE events
 *
 * @param client - The Discord.js Client to track
 */
function trackClient(client) {
  if (trackedClients.has(client)) return
  trackedClients.add(client)
  client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, payload => {
    adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload)
  })
  client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, payload => {
    if (
      payload.guild_id &&
      payload.session_id &&
      payload.user_id === client.user?.id
    ) {
      // @ts-expect-error TODO: currently voice is using a different discord-api-types version than discord.js
      adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload)
    }
  })
  client.on(Events.SHARD_DISCONNECT, (_, shardId) => {
    const guilds = trackedShards.get(shardId)
    if (guilds) {
      for (const guildID of guilds.values()) {
        adapters.get(guildID)?.destroy()
      }
    }
    trackedShards.delete(shardId)
  })
}

function trackGuild(guild) {
  let guilds = trackedShards.get(guild.shardId)
  if (!guilds) {
    guilds = new Set()
    trackedShards.set(guild.shardId, guilds)
  }
  guilds.add(guild.id)
}

/**
 * Creates an adapter for a Voice Channel.
 *
 * @param channel - The channel to create the adapter for
 */
function createDiscordJSAdapter(channel) {
  return methods => {
    adapters.set(channel.guild.id, methods)
    trackClient(channel.client)
    trackGuild(channel.guild)
    return {
      sendPayload(data) {
        if (channel.guild.shard.status === Status.READY) {
          channel.guild.shard.send(data)
          return true
        }
        return false
      },
      destroy() {
        return adapters.delete(channel.guild.id)
      }
    }
  }
}
