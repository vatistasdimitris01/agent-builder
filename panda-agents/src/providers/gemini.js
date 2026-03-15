import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';

export const chat = async ({ messages, stream, model = 'gemini-1.5-flash' }) => {
  const apiKey = config.get('geminiApiKey');
  if (!apiKey) {
    throw new Error('Gemini API Key not found. Please run "panda setup" to configure.');
  }

  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  const systemInstruction = systemMessage ? systemMessage.content : undefined;

  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model, systemInstruction });

  const history = userMessages.slice(0, -1).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const lastMessage = userMessages[userMessages.length - 1].content;
  const chat = genModel.startChat({ history });

  if (stream) {
    const result = await chat.sendMessageStream(lastMessage);
    
    // Transform Gemini stream to OpenAI-compatible format
    async function* transformStream() {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield {
          choices: [{
            delta: { content: text }
          }]
        };
      }
    }
    
    return transformStream();
  } else {
    return chat.sendMessage(lastMessage);
  }
};

export const getModels = async (apiKey) => {
  // Gemini/Google Generative AI SDK doesn't expose a simple listModels method on the client instance directly in the same way.
  // We'll return a curated list of known models for now to ensure stability.
  return [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro'
  ];
};
