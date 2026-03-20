import { program } from 'commander';
import { render } from 'ink';
import React from 'react';
import { createRequire } from 'module';
import App from '../src/ui/App.jsx';
import setup from '../src/ui/setup.js';
import runner from '../src/agent/runner.js';
import telegram from '../src/integrations/telegram.js';
import { startBot } from '../src/integrations/discord.js';
import { startWhatsApp } from '../src/integrations/whatsapp.js';
import skillsLoader from '../src/skills/loader.js';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

program
  .name('panda')
  .description('Panda Agents CLI')
  .version(packageJson.version);

program
  .command('chat')
  .description('Start an interactive chat session')
  .action(() => {
    console.clear();
    render(React.createElement(App));
  });

program
  .command('telegram')
  .description('Start the Telegram bot integration')
  .action(async () => {
    await telegram.start();
  });

program
  .command('skills')
  .description('Manage skills')
  .action(async () => {
    const skills = await skillsLoader.listSkills();
    console.log('Available Skills:');
    skills.forEach(skill => console.log(`- ${skill.name} (${skill.version})`));
  });

program
  .command('run <task>')
  .description('Run a specific task directly')
  .action(async (task) => {
    await runner.run({ messages: [{ role: 'user', content: task }], provider: 'openai' }); // Default provider for now
  });

program
  .command('setup')
  .description('Run the setup wizard')
  .action(async () => {
    await setup.run();
  });

program
  .command('gateway')
  .description('Start Panda Gateway (Terminal + Bots)')
  .action(async () => {
    console.clear();
    console.log('Starting Panda Gateway...');
    
    // Start Integrations (non-blocking)
    telegram.start().catch(err => console.error('Telegram Error:', err));
    startBot().catch(err => console.error('Discord Error:', err));
    startWhatsApp().catch(err => console.error('WhatsApp Error:', err));

    // Start Interactive CLI
    // We render the App component which handles the chat UI
    render(React.createElement(App));
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
