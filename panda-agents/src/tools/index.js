import webSearch from './webSearch.js';
import filesystem from './filesystem.js';
import googleCalendar from './googleCalendar.js';
import runCommand from './runCommand.js';
import telegram from './telegram.js';
import fileOrganizer from './fileOrganizer.js';
import browser from './browser.js';
import computer from './computer.js';
import discord from './discord.js';
import whatsapp from './whatsapp.js';

const tools = {
  webSearch,
  filesystem,
  googleCalendar,
  runCommand,
  telegram,
  fileOrganizer,
  browser,
  computer,
  discord,
  whatsapp
};

const registry = {};

// Register all tools
Object.keys(tools).forEach(toolName => {
  registry[toolName] = tools[toolName];
});

export { registry };

export const execute = async (toolName, args) => {
  if (!registry[toolName]) {
    throw new Error(`Tool ${toolName} not found`);
  }
  return registry[toolName].execute(args);
};
