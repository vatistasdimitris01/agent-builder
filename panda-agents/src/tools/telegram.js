import { getBot } from '../integrations/botInstance.js';
import fs from 'fs-extra';
import { InputFile } from 'grammy';

const execute = async ({ command, args }) => {
  const bot = getBot();
  if (!bot) {
    return 'Telegram bot is not running.';
  }

  try {
    switch (command) {
      case 'sendMessage':
        await bot.api.sendMessage(args.chatId, args.text);
        return 'Message sent.';
      case 'sendPhoto':
        // Grammy supports InputFile from path
        if (await fs.pathExists(args.photoPath)) {
          await bot.api.sendPhoto(args.chatId, new InputFile(args.photoPath));
          return 'Photo sent.';
        } else {
          return `Photo not found at ${args.photoPath}`;
        }
      default:
        return 'Unknown command.';
    }
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

export default { 
  name: 'telegram',
  description: 'Send messages or media via Telegram',
  parameters: {
    type: 'object',
    properties: {
      command: { 
        type: 'string', 
        enum: ['sendMessage', 'sendPhoto'],
        description: 'The Telegram command to execute'
      },
      args: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'The chat ID to send to' },
          text: { type: 'string', description: 'Text message content' },
          photoPath: { type: 'string', description: 'Path to the photo file' }
        },
        required: ['chatId']
      }
    },
    required: ['command', 'args']
  },
  execute 
};
