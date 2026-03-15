import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import config from '../../config/index.js';

const SettingsScreen = ({ onBack }) => {
  const [activeField, setActiveField] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const settingsItems = [
    { label: 'Provider (openai, anthropic, etc.)', value: 'provider' },
    { label: 'Model Name', value: 'model' },
    { label: 'OpenAI API Key', value: 'openaiApiKey' },
    { label: 'Anthropic API Key', value: 'anthropicApiKey' },
    { label: 'Groq API Key', value: 'groqApiKey' },
    { label: 'Telegram Token', value: 'telegramToken' },
    { label: 'Allowed Filesystem Directory', value: 'allowedFilesystemDir' },
    { label: 'Theme', value: 'theme' },
    { label: 'Back to Menu', value: 'back' }
  ];

  const handleSelect = (item) => {
    if (item.value === 'back') {
      if (onBack) onBack();
      return;
    }
    setActiveField(item.value);
    setInputValue(config.get(item.value) || '');
  };

  const handleSave = (value) => {
    config.set(activeField, value);
    setActiveField(null);
  };

  if (activeField) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
        <Text bold>Editing: {activeField}</Text>
        <Text color="gray">Current value: {config.get(activeField)}</Text>
        <Box marginTop={1}>
          <Text color="green">New Value: </Text>
          <TextInput 
            value={inputValue} 
            onChange={setInputValue} 
            onSubmit={handleSave} 
          />
        </Box>
        <Text color="gray" italic>(Press Enter to save)</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold underline marginBottom={1}>Settings</Text>
      <SelectInput items={settingsItems} onSelect={handleSelect} />
    </Box>
  );
};

export default SettingsScreen;
