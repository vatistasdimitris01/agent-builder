import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import loader from '../../skills/loader.js';

const SkillsScreen = () => {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const loadedSkills = await loader.listSkills();
        setSkills(loadedSkills);
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, []);

  if (isLoading) {
    return <Text color="yellow">Loading skills...</Text>;
  }

  if (skills.length === 0) {
    return <Text color="gray">No skills found.</Text>;
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="magenta" padding={1}>
      <Text bold underline marginBottom={1}>Available Skills</Text>
      {skills.map((skill, index) => (
        <Box key={index} flexDirection="column" marginBottom={1}>
          <Text bold color="green">➜ {skill.name}</Text>
          <Text color="gray">  Path: {skill.path}</Text>
          <Text color="gray">  Version: {skill.version}</Text>
        </Box>
      ))}
    </Box>
  );
};

export default SkillsScreen;
