"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiscordJSAdapter = void 0;
const v10_1 = require("discord-api-types/v10");
const discord_js_1 = require("discord.js");
const { Events, Status } = discord_js_1.Constants;
const adapters = new Map();
const trackedClients = new Set();
const trackedShards = new Map();
/**
 * Tracks a Discord.js client, listening to VOICE_SERVER_UPDATE and VOICE_STATE_UPDATE events
 *
 * @param client - The Discord.js Client to track
 */
function trackClient(client) {
    if (trackedClients.has(client))
        return;
    trackedClients.add(client);
    client.ws.on(v10_1.GatewayDispatchEvents.VoiceServerUpdate, (payload) => {
        adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
    });
    client.ws.on(v10_1.GatewayDispatchEvents.VoiceStateUpdate, (payload) => {
        if (payload.guild_id && payload.session_id && payload.user_id === client.user?.id) {
            // @ts-expect-error TODO: currently voice is using a different discord-api-types version than discord.js
            adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
        }
    });
    client.on(Events.SHARD_DISCONNECT, (_, shardId) => {
        const guilds = trackedShards.get(shardId);
        if (guilds) {
            for (const guildID of guilds.values()) {
                adapters.get(guildID)?.destroy();
            }
        }
        trackedShards.delete(shardId);
    });
}
function trackGuild(guild) {
    let guilds = trackedShards.get(guild.shardId);
    if (!guilds) {
        guilds = new Set();
        trackedShards.set(guild.shardId, guilds);
    }
    guilds.add(guild.id);
}
/**
 * Creates an adapter for a Voice Channel.
 *
 * @param channel - The channel to create the adapter for
 */
function createDiscordJSAdapter(channel) {
    return (methods) => {
        adapters.set(channel.guild.id, methods);
        trackClient(channel.client);
        trackGuild(channel.guild);
        return {
            sendPayload(data) {
                if (channel.guild.shard.status === Status.READY) {
                    channel.guild.shard.send(data);
                    return true;
                }
                return false;
            },
            destroy() {
                return adapters.delete(channel.guild.id);
            },
        };
    };
}
exports.createDiscordJSAdapter = createDiscordJSAdapter;
//# sourceMappingURL=adapter.js.map