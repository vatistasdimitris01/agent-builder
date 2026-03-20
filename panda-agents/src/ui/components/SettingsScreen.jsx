import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import config from '../../config/index.js';
import { syncAllModels } from '../../providers/index.js';

const SettingsScreen = ({ onBack }) => {
  const [mode, setMode] = useState('main'); // main, edit_field
  const [activeField, setActiveField] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Auto-sync models on mount
  useEffect(() => {
    const runSync = async () => {
      setIsSyncing(true);
      try {
        const count = await syncAllModels();
        if (count > 0) setStatusMessage(`Auto-synced ${count} new models!`);
      } catch (e) {}
      setIsSyncing(false);
      setTimeout(() => setStatusMessage(''), 3000);
    };
    runSync();

    // Cleanup default openai model if any
    const models = config.get('models') || [];
    if (models.some(m => m.id === 'default-openai')) {
      const filtered = models.filter(m => m.id !== 'default-openai');
      config.set('models', filtered);
      if (config.get('selectedModelId') === 'default-openai') {
        config.set('selectedModelId', filtered[0]?.id || '');
      }
    }
  }, []);

  const settingsItems = [
    { label: 'OpenAI API Key', value: 'openaiApiKey' },
    { label: 'Anthropic API Key', value: 'anthropicApiKey' },
    { label: 'Groq API Key', value: 'groqApiKey' },
    { label: 'Gemini API Key', value: 'geminiApiKey' },
    { label: 'Ollama Base URL', value: 'ollamaBaseUrl' },
    { label: 'Telegram Token', value: 'telegramToken' },
    { label: 'Allowed Filesystem Directory', value: 'allowedFilesystemDir' },
    { label: 'Theme', value: 'theme' },
    { label: 'Force Sync Models', value: 'sync' },
    { label: 'Back to Chat', value: 'back' }
  ];

  const handleSelect = async (item) => {
    if (item.value === 'back') {
      if (onBack) onBack();
      return;
    }
    if (item.value === 'sync') {
      setIsSyncing(true);
      setStatusMessage('Syncing all models...');
      const count = await syncAllModels();
      setStatusMessage(`Sync complete! Added ${count} models.`);
      setIsSyncing(false);
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    setActiveField(item.value);
    setInputValue(String(config.get(item.value) || ''));
    setMode('edit_field');
  };

  const handleSave = async (value) => {
    config.set(activeField, value);
    setMode('main');
    setActiveField(null);
    
    // If an API key or URL was updated, trigger a sync
    if (activeField.toLowerCase().includes('apikey') || activeField === 'ollamaBaseUrl') {
      setIsSyncing(true);
      setStatusMessage('Updating model list...');
      await syncAllModels();
      setIsSyncing(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  if (mode === 'edit_field') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
        <Text bold>Editing: {activeField}</Text>
        <Box marginTop={1}>
          <Text color="green">Value: </Text>
          <TextInput value={inputValue} onChange={setInputValue} onSubmit={handleSave} />
        </Box>
        <Text color="gray" italic>(Press Enter to save)</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold underline marginBottom={1}>Settings</Text>
      {statusMessage ? (
        <Box paddingX={1} marginBottom={1}>
          <Text cyan>{isSyncing ? '⏳ ' : '✅ '}{statusMessage}</Text>
        </Box>
      ) : null}
      <SelectInput items={settingsItems} onSelect={handleSelect} />
    </Box>
  );
};

export default SettingsScreen;
