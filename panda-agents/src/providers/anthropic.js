import { Anthropic } from '@anthropic-ai/sdk';
import config from '../config/index.js';

export const chat = async ({ messages, stream, model = 'claude-3-opus-20240229' }) => {
  const apiKey = config.get('anthropicApiKey');
  if (!apiKey) {
    throw new Error('Anthropic API Key not found. Please run "panda setup" to configure.');
  }

  const client = new Anthropic({ apiKey });

  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  const system = systemMessage ? systemMessage.content : undefined;

  const streamResult = await client.messages.create({
    messages: userMessages,
    model,
    system,
    stream: stream || false,
    max_tokens: 1024,
  });

  if (!stream) {
    // Wrap non-stream response in a similar structure if needed, but runner currently only uses stream
    return streamResult;
  }

  // Transform Anthropic stream to OpenAI-compatible format for the runner
  async function* transformStream() {
    for await (const event of streamResult) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield {
          choices: [{
            delta: { content: event.delta.text }
          }]
        };
      }
      // Handle tool calls if Anthropic supported them natively via stream in the future
    }
  }

  return transformStream();
};

export const getModels = async (apiKey) => {
  // Anthropic doesn't have a public models list endpoint in the SDK yet that returns all available models easily.
  // We will return a curated list of known models for now to be safe.
  return [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
    'claude-instant-1.2'
  ];
};
