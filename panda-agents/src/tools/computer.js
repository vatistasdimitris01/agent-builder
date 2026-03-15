import screenshot from 'screenshot-desktop';
import { exec } from 'child_process';
import path from 'path';

const execute = async ({ command, args }) => {
  try {
    switch (command) {
      case 'screenshot':
        const filename = `screenshot_${Date.now()}.png`;
        const output = await screenshot({ filename });
        return `Screenshot saved to ${output}`;
      
      case 'getScreenSize':
        const { stdout } = await exec('system_profiler SPDisplaysDataType | grep Resolution');
        return stdout.trim();

      case 'openApp':
        await exec(`open -a "${args.appName}"`);
        return `Opened ${args.appName}`;

      case 'type':
        // macOS specific via osascript
        if (process.platform === 'darwin') {
          const script = `tell application "System Events" to keystroke "${args.text}"`;
          await exec(`osascript -e '${script}'`);
          return `Typed "${args.text}"`;
        }
        return 'Typing supported only on macOS currently.';

      case 'click':
        // Requires cliclick or similar if not using accessibility API directly which is complex in pure JS without deps.
        // We'll skip click for now unless we use a library like robotjs which failed install.
        return 'Clicking not supported in this version without additional native dependencies.';

      default:
        return `Unknown command: ${command}`;
    }
  } catch (error) {
    return `Computer Control Error: ${error.message}`;
  }
};

export default {
  name: 'computerUse',
  description: 'Control the computer to take screenshots, open apps, and type text',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        enum: ['screenshot', 'getScreenSize', 'openApp', 'type'],
        description: 'Computer action to perform'
      },
      args: {
        type: 'object',
        properties: {
          appName: { type: 'string', description: 'Application name to open' },
          text: { type: 'string', description: 'Text to type' },
          x: { type: 'number', description: 'X coordinate' },
          y: { type: 'number', description: 'Y coordinate' }
        }
      }
    },
    required: ['command']
  },
  execute
};
