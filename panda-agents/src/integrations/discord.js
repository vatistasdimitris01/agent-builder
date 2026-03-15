import { Client, GatewayIntentBits, WebhookClient } from 'discord.js';
import config from '../config/index.js';

let botClient = null;

export const startBot = async () => {
  const token = config.get('discordToken');
  if (!token) return;

  botClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  botClient.once('ready', () => {
    console.log(`Discord Bot logged in as ${botClient.user.tag}`);
  });

  botClient.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    // Here we could implement chat functionality similar to Telegram
    // For now, let's just log it
    // console.log(`Discord Message: ${message.content}`);
  });

  await botClient.login(token);
};

export const getBotClient = () => botClient;

export const sendWebhook = async (url, content, username = 'Panda Agent') => {
  if (!url) throw new Error('Webhook URL is required');
  const webhookClient = new WebhookClient({ url });
  
  await webhookClient.send({
    content,
    username,
    avatarURL: 'https://i.imgur.com/4M34hi2.png', // Panda icon placeholder
  });
};
