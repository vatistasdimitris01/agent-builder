import { Bot } from 'grammy';
import config from '../config/index.js';
import runner from '../agent/runner.js';
import { setBot } from './botInstance.js';

export const start = async () => {
  const token = config.get('telegramToken');
  if (!token) {
    console.error('Telegram Token not configured. Please run "panda setup" to configure.');
    return;
  }

  const bot = new Bot(token);
  setBot(bot);

  bot.command('start', (ctx) => ctx.reply('Welcome to Panda Agents! I am ready to assist you.'));
  bot.command('help', (ctx) => ctx.reply('Commands: /start, /help, /clear, /skills, /model'));

  bot.command('model', async (ctx) => {
    const args = ctx.match;
    const models = config.get('models') || [];
    const selectedId = config.get('selectedModelId');

    if (!args) {
      // List models
      const modelList = models.map(m => {
        const isSelected = m.id === selectedId;
        return `${isSelected ? '●' : '○'} ${m.name} (${m.provider}/${m.model})\nID: ${m.id}`;
      }).join('\n\n');
      
      await ctx.reply(`Available models:\n\n${modelList}\n\nTo switch, use /model <id>`);
      return;
    }

    // Switch model
    const targetId = args.trim();
    const targetModel = models.find(m => m.id === targetId || m.name === targetId);

    if (targetModel) {
      config.set('selectedModelId', targetModel.id);
      await ctx.reply(`Switched to model: ${targetModel.name}`);
    } else {
      await ctx.reply(`Model ID or Name "${targetId}" not found. Use /model to see available IDs.`);
    }
  });

  bot.on('message', async (ctx) => {
    const userMessage = ctx.message.text;
    const messages = [{ role: 'user', content: userMessage }];
    
    // Add context for the agent to know it's in a Telegram chat and the chat ID
    // We can add a system message or append to the user message
    messages.push({ 
      role: 'system', 
      content: `You are chatting via Telegram. The chat ID is ${ctx.chat.id}. You can use the 'telegram' tool to send messages or photos.` 
    });
    
    try {
      const selectedModelId = config.get('selectedModelId');
      const models = config.get('models') || [];
      const selectedModel = models.find(m => m.id === selectedModelId) || models[0] || {};

      const responseStream = runner.run({ 
        messages, 
        provider: selectedModel.provider || 'openai',
        model: selectedModel.model
      });
      
      let replyText = '';
      
      for await (const chunk of responseStream) {
        if (chunk.type === 'content') {
          replyText += chunk.content;
        }
        // If tool executes, we might want to notify user? 
        // For now, let's just stream content.
      }
      
      if (replyText) {
        await ctx.reply(replyText);
      } else {
        // Maybe a tool sent a photo and no text response was generated?
        // We should check if we already sent something via tool.
        // But for now, if no text, say nothing or check if tool was called.
      }
      
    } catch (error) {
      console.error('Error handling message:', error);
      await ctx.reply('Sorry, an error occurred while processing your request.');
    }
  });

  bot.start();
  console.log('Telegram bot started!');
};

export default { start };
