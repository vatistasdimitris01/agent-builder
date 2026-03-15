import { sendMessage, getClient } from '../integrations/whatsapp.js';
import config from '../config/index.js';

const execute = async ({ command, args }) => {
  try {
    switch (command) {
      case 'send':
        if (!config.get('whatsappEnabled')) return 'Error: WhatsApp integration is disabled.';
        if (!getClient()) return 'Error: WhatsApp client not initialized or not logged in.';
        
        await sendMessage(args.to, args.message);
        return `Message sent to ${args.to} via WhatsApp.`;

      default:
        return `Unknown command: ${command}`;
    }
  } catch (error) {
    return `WhatsApp Error: ${error.message}`;
  }
};

export default {
  name: 'whatsapp',
  description: 'Send messages via WhatsApp Web integration',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        enum: ['send'],
        description: 'Action to perform'
      },
      args: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Phone number (e.g. 1234567890) or chat ID' },
          message: { type: 'string', description: 'Message content' }
        },
        required: ['to', 'message']
      }
    },
    required: ['command', 'args']
  },
  execute
};
