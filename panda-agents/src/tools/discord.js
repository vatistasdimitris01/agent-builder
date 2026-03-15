import { sendWebhook, getBotClient } from '../integrations/discord.js';
import config from '../config/index.js';

const execute = async ({ command, args }) => {
  try {
    switch (command) {
      case 'sendWebhook':
        const url = args.url || config.get('discordWebhookUrl');
        if (!url) return 'Error: Webhook URL not configured and not provided.';
        
        await sendWebhook(url, args.message, args.username);
        return 'Message sent to Discord Webhook successfully.';

      case 'sendMessage':
        const bot = getBotClient();
        if (!bot) return 'Error: Discord Bot not running. Check your configuration.';
        
        const channel = await bot.channels.fetch(args.channelId);
        if (!channel) return `Error: Channel ${args.channelId} not found.`;
        
        await channel.send(args.message);
        return `Message sent to channel ${channel.name}`;

      default:
        return `Unknown command: ${command}`;
    }
  } catch (error) {
    return `Discord Error: ${error.message}`;
  }
};

export default {
  name: 'discord',
  description: 'Interact with Discord via Webhooks or Bot',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        enum: ['sendWebhook', 'sendMessage'],
        description: 'Action to perform'
      },
      args: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Content of the message' },
          url: { type: 'string', description: 'Webhook URL (optional if configured)' },
          username: { type: 'string', description: 'Username override for webhook' },
          channelId: { type: 'string', description: 'Channel ID for bot message' }
        },
        required: ['message']
      }
    },
    required: ['command', 'args']
  },
  execute
};
