import Conf from 'conf';
import os from 'os';
import path from 'path';

// Use local directory for sandbox compatibility
const configDir = path.join(process.cwd(), '.panda');

const config = new Conf({
  projectName: 'panda-agents',
  cwd: configDir,
  schema: {
    selectedModelId: {
      type: 'string',
      default: ''
    },
    models: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          provider: { type: 'string' },
          model: { type: 'string' }
        }
      }
    },
    openaiApiKey: {
      type: 'string',
      default: ''
    },
    anthropicApiKey: {
      type: 'string',
      default: ''
    },
    groqApiKey: {
      type: 'string',
      default: ''
    },
    geminiApiKey: {
      type: 'string',
      default: ''
    },
    ollamaBaseUrl: {
      type: 'string',
      default: 'http://localhost:11434'
    },
    theme: {
      type: 'string',
      default: 'panda'
    },
    artSize: {
      type: 'string',
      default: 'medium'
    },
    discordToken: {
      type: 'string',
      default: ''
    },
    discordWebhookUrl: {
      type: 'string',
      default: ''
    },
    whatsappEnabled: {
      type: 'boolean',
      default: false
    }
  }
});

export default config;
