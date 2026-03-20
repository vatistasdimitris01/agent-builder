#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsxPath = join(__dirname, '..', 'node_modules', '.bin', 'tsx');
const mainPath = join(__dirname, 'panda-main.js');

const child = spawn(tsxPath, [mainPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
