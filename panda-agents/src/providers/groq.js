import { Groq } from 'groq-sdk';
import config from '../config/index.js';

export const chat = async ({ messages, stream, model = 'llama3-8b-8192', tools }) => {
  const apiKey = config.get('groqApiKey');
  if (!apiKey) {
    throw new Error('Groq API Key not found. Please run "panda setup" to configure.');
  }

  const client = new Groq({ apiKey });

  const params = {
    messages,
    model,
    stream: stream || false,
  };

  if (tools && tools.length > 0) {
    params.tools = tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));
  }

  return client.chat.completions.create(params);
};

export const getModels = async (apiKey) => {
  const client = new Groq({ apiKey });
  const list = await client.models.list();
  return list.data.map(m => m.id).sort();
};
