import { OpenAI } from 'openai';
import config from '../config/index.js';

export const chat = async ({ messages, stream, model = 'gpt-4o', tools }) => {
  const apiKey = config.get('openaiApiKey');
  if (!apiKey) {
    throw new Error('OpenAI API Key not found. Please run "panda setup" to configure.');
  }

  const client = new OpenAI({ apiKey });

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
  const client = new OpenAI({ apiKey });
  const list = await client.models.list();
  return list.data.map(m => m.id).sort();
};
