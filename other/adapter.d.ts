import type { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
/**
 * Creates an adapter for a Voice Channel.
 *
 * @param channel - The channel to create the adapter for
 */
export declare function createDiscordJSAdapter(channel: VoiceBasedChannel): DiscordGatewayAdapterCreator;
