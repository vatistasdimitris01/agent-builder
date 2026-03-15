import axios from 'axios';
import config from '../config/index.js';

export const chat = async ({ messages, stream, model = 'llama3' }) => {
  const baseUrl = config.get('ollamaBaseUrl') || 'http://localhost:11434';
  
  const response = await axios.post(`${baseUrl}/api/chat`, {
    model,
    messages,
    stream: stream || false
  }, {
    responseType: stream ? 'stream' : 'json'
  });

  if (stream) {
    async function* transformStream() {
      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message && json.message.content) {
              yield { content: json.message.content };
            }
          } catch (e) {
            // ignore partial JSON
          }
        }
      }
    }
    return transformStream();
  }

  return response.data;
};

export const getModels = async (baseUrl = 'http://localhost:11434') => {
  try {
    const response = await axios.get(`${baseUrl}/api/tags`);
    return response.data.models.map(m => m.name);
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error.message);
    return [];
  }
};
