import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import os from 'os';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundledSkillsPath = path.join(__dirname, '../../skills');
const userSkillsPath = path.join(os.homedir(), '.panda/skills');

export const listSkills = async () => {
  const skills = [];
  
  const loadFromDir = async (dir) => {
    if (!await fs.pathExists(dir)) return;
    const skillFiles = await glob('**/SKILL.md', { cwd: dir });
    
    for (const file of skillFiles) {
      const content = await fs.readFile(path.join(dir, file), 'utf8');
      const nameMatch = content.match(/#\s*(.+)/);
      const name = nameMatch ? nameMatch[1].trim() : path.basename(path.dirname(file));
      
      skills.push({
        name,
        path: path.join(dir, file),
        version: '1.0.0'
      });
    }
  };

  await loadFromDir(bundledSkillsPath);
  await loadFromDir(userSkillsPath);
  
  return skills;
};

export default { listSkills };
