import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import loader from '../../skills/loader.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';

const SkillsMenu = ({ onClose }) => {
  const [skills, setSkills] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState('list'); // 'list', 'create', 'actions'
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const loaded = await loader.listSkills();
      setSkills(loaded);
    } catch (e) {
      setMessage(`Error loading skills: ${e.message}`);
    }
  };

  const openInEditor = (filePath) => {
    // Basic heuristic for opening file in editor
    const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    // If user has CODE_EDITOR env var, use it
    const editor = process.env.CODE_EDITOR || 'code'; 
    
    // Try VS Code first if possible, otherwise system default
    exec(`${editor} "${filePath}"`, (err) => {
      if (err) {
        // Fallback to system default open
        exec(`${cmd} "${filePath}"`);
      }
    });
    setMessage(`Opening ${path.basename(filePath)}...`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreate = async () => {
    if (!newSkillName.trim()) return;
    
    const safeName = newSkillName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const skillDir = path.join(os.homedir(), '.panda/skills', safeName);
    const skillFile = path.join(skillDir, 'SKILL.md');
    
    try {
      await fs.ensureDir(skillDir);
      const template = `# ${newSkillName}
Description: A custom skill created by you.

Usage:
- command: "${safeName}"
`;
      await fs.writeFile(skillFile, template);
      setMessage(`Skill created!`);
      await loadSkills();
      setMode('list');
      setNewSkillName('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  useInput((input, key) => {
    if (mode === 'list') {
      if (key.upArrow) {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      }
      if (key.downArrow) {
        setSelectedIndex(prev => Math.min(skills.length, prev + 1));
      }
      if (key.return) {
        if (selectedIndex === 0) {
          setMode('create');
        } else {
          const skill = skills[selectedIndex - 1];
          if (skill) {
            setSelectedSkill(skill);
            setMode('actions');
          }
        }
      }
      if (key.escape) {
        onClose();
      }
    } else if (mode === 'actions') {
      if (key.return) {
        if (selectedSkill) openInEditor(selectedSkill.path);
      }
      if (key.escape) {
        setMode('list');
        setSelectedSkill(null);
      }
    } else if (mode === 'create') {
      if (key.escape) {
        setMode('list');
        setNewSkillName('');
      }
      // TextInput handles return for submission
    }
  });

  if (mode === 'create') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
        <Text bold>Create New Skill</Text>
        <Box marginTop={1}>
          <Text>Skill Name: </Text>
          <TextInput 
            value={newSkillName} 
            onChange={setNewSkillName} 
            onSubmit={handleCreate}
          />
        </Box>
        <Text color="gray" marginTop={1}>Press Enter to create, Esc to cancel</Text>
        {message && <Text color="red">{message}</Text>}
      </Box>
    );
  }

  if (mode === 'actions') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
        <Text bold underline>{selectedSkill?.name}</Text>
        <Text color="gray">{selectedSkill?.path}</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>Press <Text bold color="green">Enter</Text> to edit file.</Text>
          <Text>Press <Text bold color="red">Esc</Text> to go back.</Text>
        </Box>
        {message && <Text color="yellow" marginTop={1}>{message}</Text>}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1} width="100%">
      <Box justifyContent="space-between">
        <Text bold>Skills Management</Text>
        <Text color="gray">({skills.length} skills)</Text>
      </Box>
      
      <Box flexDirection="column" marginTop={1}>
        <Box>
          <Text color={selectedIndex === 0 ? 'cyan' : 'white'}>
            {selectedIndex === 0 ? '❯ ' : '  '} 
            <Text bold>+ Create New Skill</Text>
          </Text>
        </Box>
        
        {skills.map((skill, index) => (
          <Box key={index}>
            <Text color={selectedIndex === index + 1 ? 'cyan' : 'white'}>
              {selectedIndex === index + 1 ? '❯ ' : '  '} 
              {skill.name}
            </Text>
          </Box>
        ))}
      </Box>
      
      <Box marginTop={1} borderStyle="single" borderLeft={false} borderRight={false} borderBottom={false} borderTop={true} borderColor="gray" paddingTop={1}>
        <Text color="gray" dimColor>▲/▼ Navigate • Enter Select • Esc Close</Text>
      </Box>
      {message && <Text color="yellow">{message}</Text>}
    </Box>
  );
};

export default SkillsMenu;
