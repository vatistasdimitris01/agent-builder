import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import config from '../config/index.js';

let client = null;

export const startWhatsApp = async () => {
  if (!config.get('whatsappEnabled')) {
    console.log('WhatsApp integration disabled in config.');
    return;
  }

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'panda-client' })
  });

  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above to log in to WhatsApp Web.');
  });

  client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
  });

  client.on('message', message => {
    // Basic message handling or forwarding could be implemented here
    // console.log(`WhatsApp Message from ${message.from}: ${message.body}`);
  });

  await client.initialize();
};

export const getClient = () => client;

export const sendMessage = async (to, message) => {
  if (!client) throw new Error('WhatsApp client not initialized');
  
  // Format phone number: remove non-digits, ensure country code if missing (defaulting to input)
  // whatsapp-web.js expects format like '1234567890@c.us'
  const chatId = to.includes('@') ? to : `${to.replace(/\D/g, '')}@c.us`;
  
  await client.sendMessage(chatId, message);
  return `Message sent to ${chatId}`;
};
