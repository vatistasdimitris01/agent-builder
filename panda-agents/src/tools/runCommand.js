import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const execute = async ({ command, cwd }) => {
  try {
    const options = cwd ? { cwd } : {};
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
