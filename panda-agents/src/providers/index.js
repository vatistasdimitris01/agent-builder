import config from '../config/index.js';
import * as openai from './openai.js';
import * as anthropic from './anthropic.js';
import * as groq from './groq.js';
import * as ollama from './ollama.js';
import * as gemini from './gemini.js';

const providers = {
  openai,
  anthropic,
  groq,
  ollama,
  gemini
};

export const chat = async (options) => {
  const providerName = options.provider || config.get('provider');
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Provider ${providerName} not found`);
  }
  return provider.chat(options);
};
