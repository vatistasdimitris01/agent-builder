import fs from 'fs-extra';
import path from 'path';

const execute = async ({ command, args }) => {
  const targetDir = path.resolve(args.directory || process.cwd());
  
  try {
    if (!await fs.pathExists(targetDir)) {
      return `Directory not found: ${targetDir}`;
    }

    switch (command) {
      case 'organize':
        const files = await fs.readdir(targetDir);
        let movedCount = 0;

        for (const file of files) {
          const filePath = path.join(targetDir, file);
          const stat = await fs.stat(filePath);

          if (stat.isFile() && !file.startsWith('.')) {
            const ext = path.extname(file).toLowerCase().substring(1) || 'others';
            const typeDir = path.join(targetDir, ext);
            
            await fs.ensureDir(typeDir);
            await fs.move(filePath, path.join(typeDir, file));
            movedCount++;
          }
        }
        return `Organized ${movedCount} files in ${targetDir} by extension.`;

      case 'cleanup':
        // Remove empty directories
        const items = await fs.readdir(targetDir);
        let removedCount = 0;
        
        for (const item of items) {
          const itemPath = path.join(targetDir, item);
          const stat = await fs.stat(itemPath);
          
          if (stat.isDirectory()) {
            const contents = await fs.readdir(itemPath);
            if (contents.length === 0) {
              await fs.remove(itemPath);
              removedCount++;
            }
          }
        }
        return `Removed ${removedCount} empty directories in ${targetDir}.`;

      default:
        return `Unknown command: ${command}`;
    }
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

export default {
  name: 'fileOrganizer',
  description: 'Organize files in directories by extension or cleanup empty folders',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        enum: ['organize', 'cleanup'],
        description: 'The operation to perform'
      },
      args: {
        type: 'object',
        properties: {
          directory: { type: 'string', description: 'Target directory to organize' }
        },
        required: ['directory']
      }
    },
    required: ['command', 'args']
  },
  execute
};
