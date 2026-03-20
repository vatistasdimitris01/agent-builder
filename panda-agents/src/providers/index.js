import config from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';
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

export const getModelsForProvider = async (providerName) => {
  const provider = providers[providerName];
  if (!provider || !provider.getModels) return [];

  const apiKeyMap = {
    openai: config.get('openaiApiKey'),
    anthropic: config.get('anthropicApiKey'),
    groq: config.get('groqApiKey'),
    gemini: config.get('geminiApiKey'),
    ollama: config.get('ollamaBaseUrl') || 'http://localhost:11434'
  };

  const cred = apiKeyMap[providerName];
  if (!cred && providerName !== 'ollama') return [];

  try {
    return await provider.getModels(cred);
  } catch (error) {
    // console.error(`Failed to fetch models for ${providerName}:`, error.message);
    return [];
  }
};

export const syncAllModels = async () => {
  const availableProviders = ['ollama', 'groq', 'openai', 'anthropic', 'gemini'];
  const existingModels = config.get('models') || [];
  let addedCount = 0;

  for (const provider of availableProviders) {
    const modelIds = await getModelsForProvider(provider);
    if (modelIds && modelIds.length > 0) {
      const newModels = modelIds
        .filter(id => !existingModels.some(em => em.model === id && em.provider === provider))
        .map(id => ({
          id: uuidv4(),
          name: id,
          provider: provider,
          model: id
        }));
      
      if (newModels.length > 0) {
        existingModels.push(...newModels);
        addedCount += newModels.length;
      }
    }
  }

  if (addedCount > 0) {
    config.set('models', existingModels);
    if (!config.get('selectedModelId') && existingModels.length > 0) {
      config.set('selectedModelId', existingModels[0].id);
    }
  }
  return addedCount;
};
