import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import config from '../config/index.js';

// Helper to ensure path is within allowed directory
const ensureAllowedPath = (targetPath) => {
  const allowedDir = config.get('allowedFilesystemDir') || process.cwd();
  const absoluteTarget = path.resolve(allowedDir, targetPath);
  
  if (!absoluteTarget.startsWith(allowedDir)) {
    throw new Error(`Access denied. Path must be within ${allowedDir}`);
  }
  return absoluteTarget;
};

const execute = async ({ command, args }) => {
  try {
    let targetPath, sourcePath, destPath;

    if (args.path) targetPath = ensureAllowedPath(args.path);
    if (args.source) sourcePath = ensureAllowedPath(args.source);
    if (args.destination) destPath = ensureAllowedPath(args.destination);

    switch (command) {
      case 'read':
        return await fs.readFile(targetPath, 'utf8');
      case 'write':
        await fs.ensureDir(path.dirname(targetPath));
        await fs.writeFile(targetPath, args.content);
        return `Successfully wrote to ${targetPath}`;
      case 'mkdir':
        await fs.ensureDir(targetPath);
        return `Successfully created directory ${targetPath}`;
      case 'list':
        return await fs.readdir(targetPath || ensureAllowedPath('.'));
      case 'search':
        return await glob(args.pattern, { cwd: targetPath || ensureAllowedPath('.') });
      case 'move':
        await fs.move(sourcePath, destPath);
        return `Successfully moved ${sourcePath} to ${destPath}`;
      case 'delete':
        await fs.remove(targetPath);
        return `Successfully deleted ${targetPath}`;
      default:
        throw new Error(`Unknown filesystem command: ${command}`);
    }
  } catch (error) {
    return `Filesystem error: ${error.message}`;
  }
};

export default { 
  name: 'filesystem',
  description: 'Read, write, list, search, move, and delete files',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        enum: ['read', 'write', 'list', 'search', 'move', 'delete', 'mkdir'],
        description: 'The operation to perform'
      },
      args: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to file or directory' },
          content: { type: 'string', description: 'Content to write (for write command)' },
          pattern: { type: 'string', description: 'Glob pattern (for search command)' },
          source: { type: 'string', description: 'Source path (for move command)' },
          destination: { type: 'string', description: 'Destination path (for move command)' }
        },
        required: ['path'] // 'path' is needed for most, but search/move might differ. Let's make it optional in schema but validate in code or use specific args.
      }
    },
    required: ['command', 'args']
  },
  execute 
};
