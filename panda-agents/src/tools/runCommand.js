import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

const execute = async ({ command, cwd }) => {
  try {
    const isWindows = os.platform() === 'win32';
    const shell = isWindows ? 'powershell.exe' : '/bin/bash';
    const options = { 
      cwd: cwd || process.cwd(),
      shell: shell
    };
    
    const { stdout, stderr } = await execAsync(command, options);
    
    if (stderr) {
      return `Command executed with warnings/errors:\n${stderr}\nOutput:\n${stdout}`;
    }
    
    return stdout || 'Command executed successfully (no output).';
  } catch (error) {
    return `Command failed: ${error.message}\n${error.stdout ? `Output: ${error.stdout}` : ''}`;
  }
};

export default { 
  name: 'runCommand',
  description: 'Execute shell commands in the terminal',
  parameters: {
    type: 'object',
    properties: {
      command: { type: 'string', description: 'The shell command to execute' },
      cwd: { type: 'string', description: 'Working directory' }
    },
    required: ['command']
  },
  execute 
};
