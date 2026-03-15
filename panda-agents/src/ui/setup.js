import { select, input, confirm } from '@inquirer/prompts';
import config from '../config/index.js';
import chalk from 'chalk';
import ora from 'ora';
import * as providers from '../providers/index.js';

const run = async () => {
  console.log(chalk.green.bold('\nWelcome to Panda Agents Setup Wizard! 🐼\n'));

  const provider = await select({
    message: 'Select your primary AI Provider:',
    choices: [
      { name: 'OpenAI', value: 'openai' },
      { name: 'Anthropic', value: 'anthropic' },
      { name: 'Groq', value: 'groq' },
      { name: 'Ollama', value: 'ollama' },
      { name: 'Gemini', value: 'gemini' }
    ],
    default: config.get('provider') || 'openai'
  });
  config.set('provider', provider);

  let apiKey = '';
  let modelList = [];

  if (provider === 'openai') {
    apiKey = await input({
      message: 'Enter OpenAI API Key:',
      default: config.get('openaiApiKey'),
      validate: input => input.length > 0 ? true : 'API Key is required'
    });
    config.set('openaiApiKey', apiKey);
  } else if (provider === 'anthropic') {
    apiKey = await input({
      message: 'Enter Anthropic API Key:',
      default: config.get('anthropicApiKey')
    });
    config.set('anthropicApiKey', apiKey);
  } else if (provider === 'groq') {
    apiKey = await input({
      message: 'Enter Groq API Key:',
      default: config.get('groqApiKey')
    });
    config.set('groqApiKey', apiKey);
  } else if (provider === 'gemini') {
    apiKey = await input({
      message: 'Enter Gemini API Key:',
      default: config.get('geminiApiKey')
    });
    config.set('geminiApiKey', apiKey);
  } else if (provider === 'ollama') {
    apiKey = await input({
      message: 'Enter Ollama Base URL:',
      default: config.get('ollamaBaseUrl') || 'http://localhost:11434'
    });
    config.set('ollamaBaseUrl', apiKey);
  }

  // Validate API Key and fetch models
  if (apiKey) {
    const spinner = ora('Validating API Key and fetching models...').start();
    try {
      // Dynamically import the specific provider to use its getModels function
      // Since providers/index.js exports the whole module, we can access it via the imported * as providers
      // However, providers/index.js only exports `chat` function which delegates.
      // We need to import the specific provider file or update index.js to export getModels.
      // Let's import the specific file dynamically or assume we can get it from providers map if we export it.
      
      // Better approach: Import specific provider dynamically based on selection
      const providerModule = await import(`../providers/${provider}.js`);
      
      if (providerModule.getModels) {
        modelList = await providerModule.getModels(apiKey);
        spinner.succeed(`Successfully validated key and fetched ${modelList.length} models.`);
      } else {
        spinner.warn('Model listing not supported for this provider yet.');
      }
    } catch (error) {
      spinner.fail(`Failed to validate key or fetch models: ${error.message}`);
      console.log(chalk.yellow('You can continue, but the API key might be invalid.'));
    }
  }

  // Select Model
  if (modelList.length > 0) {
    const selectedModel = await select({
      message: 'Select a model to use:',
      choices: modelList.map(m => ({ name: m, value: m })),
      default: config.get('model') || modelList[0]
    });
    config.set('model', selectedModel);
  } else {
    // Fallback if no models fetched or error
    const manualModel = await input({
      message: 'Enter Model Name (e.g. gpt-4, claude-3-opus):',
      default: config.get('model') || 'gpt-4o'
    });
    config.set('model', manualModel);
  }

  // Telegram Setup (Optional)
  const setupTelegram = await confirm({
    message: 'Configure Telegram?',
    default: !!config.get('telegramToken')
  });

  if (setupTelegram) {
    const token = await input({
      message: 'Enter Telegram Bot Token:',
      default: config.get('telegramToken'),
      validate: input => input.length > 0 ? true : 'Token is required'
    });
    config.set('telegramToken', token);
  }

  // Discord Setup (Optional)
  const setupDiscord = await confirm({
    message: 'Configure Discord (Bot or Webhook)?',
    default: !!config.get('discordToken') || !!config.get('discordWebhookUrl')
  });

  if (setupDiscord) {
    const discordChoice = await select({
      message: 'Select Discord Integration Type:',
      choices: [
        { name: 'Bot Token', value: 'bot' },
        { name: 'Webhook URL', value: 'webhook' },
        { name: 'Both', value: 'both' },
        { name: 'Skip', value: 'skip' }
      ]
    });

    if (discordChoice === 'bot' || discordChoice === 'both') {
      const token = await input({
        message: 'Enter Discord Bot Token:',
        default: config.get('discordToken'),
        validate: input => input.length > 0 ? true : 'Token is required'
      });
      config.set('discordToken', token);
    }

    if (discordChoice === 'webhook' || discordChoice === 'both') {
      const webhook = await input({
        message: 'Enter Discord Webhook URL:',
        default: config.get('discordWebhookUrl'),
        validate: input => input.length > 0 ? true : 'URL is required'
      });
      config.set('discordWebhookUrl', webhook);
    }
  }

  // WhatsApp Setup (Optional)
  const setupWhatsApp = await confirm({
    message: 'Enable WhatsApp Web Integration?',
    default: config.get('whatsappEnabled')
  });
  config.set('whatsappEnabled', setupWhatsApp);

  const theme = await select({
    message: 'Select UI Theme:',
    choices: [
      { name: 'Panda', value: 'panda' },
      { name: 'Matrix', value: 'matrix' },
      { name: 'Ocean', value: 'ocean' }
    ],
    default: config.get('theme') || 'panda'
  });
  config.set('theme', theme);

  const artSize = await select({
    message: 'Select Panda Art Size:',
    choices: [
      { name: 'Small', value: 'small' },
      { name: 'Medium', value: 'medium' },
      { name: 'Large', value: 'large' }
    ],
    default: config.get('artSize') || 'medium'
  });
  config.set('artSize', artSize);

  console.log(chalk.green('\nConfiguration saved successfully!'));
  console.log(chalk.blue('You can now run "panda chat" to start chatting.'));
};

export default { run };
