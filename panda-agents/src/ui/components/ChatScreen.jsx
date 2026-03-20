import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Markdown from './Markdown.jsx';
import runner from '../../agent/runner.js';
import config from '../../config/index.js';
import SkillsMenu from './SkillsMenu.jsx';

const SLASH_COMMANDS = [
  { cmd: '/settings', desc: 'Open config panel' },
  { cmd: '/skills', desc: 'Manage agent tools and skills' },
  { cmd: '/model', desc: 'Switch or list models' },
  { cmd: '/clear', desc: 'Clear conversation history' },
  { cmd: '/exit', desc: 'Exit Panda Agents' }
];

const ChatScreen = ({ onCommand }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSkillsMenu, setShowSkillsMenu] = useState(false);
  const [lastRenderedTime, setLastRenderedTime] = useState(0);

  const filteredCommands = SLASH_COMMANDS.filter(cmd => cmd.cmd.startsWith(input));
  const showSlashMenu = input.startsWith('/') && filteredCommands.length > 0 && !showSkillsMenu;

  useInput((inputKey, key) => {
    if (showSlashMenu) {
      if (key.upArrow) {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      }
      if (key.downArrow) {
        setSelectedIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
      }
    }
  }, { isActive: showSlashMenu });

  useEffect(() => {
    setSelectedIndex(0); // Reset selection when input changes
  }, [input]);

  const handleSubmit = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Handle slash menu selection
    if (showSlashMenu && filteredCommands[selectedIndex]) {
      const selectedCmd = filteredCommands[selectedIndex].cmd;
      if (selectedCmd === '/skills') {
        setShowSkillsMenu(true);
        setInput('');
        return;
      }
      if (selectedCmd === '/clear') {
        setMessages([]);
        setInput('');
        return;
      }
      if (selectedCmd === '/model') {
        const models = config.get('models') || [];
        const selectedId = config.get('selectedModelId');
        const modelList = models.map(m => `${m.id === selectedId ? '●' : '○'} ${m.name} (${m.id})`).join('\n');
        setMessages(prev => [...prev, { role: 'system', content: `Available models:\n${modelList}\nUse "/model <id>" to switch.` }]);
        setInput('');
        return;
      }
      if (selectedCmd === '/exit' || selectedCmd === '/quit') {
        process.exit(0);
      }
      if (onCommand) {
        onCommand(selectedCmd);
        setInput('');
        return;
      }
    }

    // Handle direct typing of commands (including /model <id>)
    if (trimmed.startsWith('/')) {
      if (trimmed === '/skills') {
        setShowSkillsMenu(true);
        setInput('');
        return;
      }
      if (trimmed === '/clear') {
        setMessages([]);
        setInput('');
        return;
      }
      if (trimmed.startsWith('/model')) {
        const models = config.get('models') || [];
        const selectedId = config.get('selectedModelId');
        const args = trimmed.split(' ').slice(1).join(' ').trim();
        
        if (!args) {
          const modelList = models.map(m => `${m.id === selectedId ? '●' : '○'} ${m.name} (${m.id})`).join('\n');
          setMessages(prev => [...prev, { role: 'system', content: `Available models:\n${modelList}\nUse "/model <id>" to switch.` }]);
          setInput('');
          return;
        }

        const targetModel = models.find(m => m.id === args || m.name === args);
        if (targetModel) {
          config.set('selectedModelId', targetModel.id);
          setMessages(prev => [...prev, { role: 'system', content: `Switched to model: ${targetModel.name}` }]);
        } else {
          setMessages(prev => [...prev, { role: 'system', content: `Model "${args}" not found.` }]);
        }
        setInput('');
        return;
      }
      if (trimmed === '/exit' || trimmed === '/quit') {
        process.exit(0);
      }
      if (onCommand) {
        onCommand(trimmed);
        setInput('');
        return;
      }
    }

    const userMsg = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsProcessing(true);
    setCurrentResponse('');

    try {
      const selectedModelId = config.get('selectedModelId');
      const models = config.get('models') || [];
      const selectedModel = models.find(m => m.id === selectedModelId) || models[0] || {};
      const provider = selectedModel.provider || 'openai';

      const responseStream = runner.run({
        messages: newMessages,
        provider,
        model: selectedModel.model
      });

      let fullContent = '';
      let lastYieldTime = Date.now();

      for await (const chunk of responseStream) {
        if (chunk.type === 'content') {
          fullContent += chunk.content;
          
          // Throttle state updates to max 10 times per second to reduce Ink lag
          const now = Date.now();
          if (now - lastYieldTime > 100) {
            setCurrentResponse(fullContent);
            lastYieldTime = now;
          }
        } else if (chunk.type === 'error') {
          setMessages(prev => [...prev, { role: 'system', content: `Error: ${chunk.error}` }]);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
      setCurrentResponse('');

    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${error.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box flexDirection="column" width="100%" flexGrow={1}>
      {/* Scrollable messages area */}
      <Box flexDirection="column" flexGrow={1} overflowY="hidden" paddingBottom={1}>
        {messages.map((msg, i) => (
          <Box key={i} flexDirection="column" marginBottom={1}>
            <Box flexDirection="row">
              <Text color={msg.role === 'user' ? 'white' : '#f47454'} bold>
                {msg.role === 'user' ? '> ' : '● '}
              </Text>
              <Box flexDirection="column" paddingLeft={1}>
                {msg.role === 'assistant' ? (
                  <Markdown>{msg.content}</Markdown>
                ) : (
                  <Text>{msg.content}</Text>
                )}
              </Box>
            </Box>
          </Box>
        ))}
        {currentResponse && (
          <Box flexDirection="column" marginBottom={1}>
            <Box flexDirection="row">
              <Text color="#f47454" bold>● </Text>
              <Box flexDirection="column" paddingLeft={1}>
                <Markdown>{currentResponse}</Markdown>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Input prompt area (matching screenshot style) */}
      <Box flexDirection="column">
        {showSkillsMenu ? (
          <SkillsMenu onClose={() => setShowSkillsMenu(false)} />
        ) : (
          <Box borderStyle="single" borderColor="gray" borderLeft={false} borderRight={false} borderBottom={false} paddingTop={1}>
            <Text bold>❯ </Text>
            <TextInput 
              value={input} 
              onChange={setInput} 
              onSubmit={handleSubmit} 
              isDisabled={isProcessing}
              placeholder={isProcessing ? "Processing..." : 'Try "refactor <filepath>"'}
            />
          </Box>
        )}

        {/* Slash command menu popover BELOW input */}
        {showSlashMenu && !isProcessing && (
          <Box flexDirection="column" borderStyle="single" borderColor="gray" borderLeft={false} borderRight={false} borderTop={false} paddingBottom={1} marginTop={1}>
            {filteredCommands.map((cmd, i) => {
              const isSelected = i === selectedIndex;
              return (
                <Box key={i} flexDirection="row">
                  <Box width={15}>
                    <Text color={isSelected ? "blue" : "gray"} bold={isSelected}>{cmd.cmd}</Text>
                  </Box>
                  <Text color={isSelected ? "white" : "gray"}>{cmd.desc}</Text>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Bottom status bar */}
        {!showSlashMenu && (
          <Box flexDirection="row" justifyContent="space-between" marginTop={1}>
            <Text color="gray">? for shortcuts</Text>
            {(() => {
              const selectedModelId = config.get('selectedModelId');
              const models = config.get('models') || [];
              const selectedModel = models.find(m => m.id === selectedModelId) || models[0] || {};
              const provider = selectedModel.provider || 'openai';
              const apiKeyName = `${provider}ApiKey`;
              const hasApiKey = config.get(apiKeyName);
              
              if (!hasApiKey && provider !== 'ollama') {
                return <Text color="#f47454">Missing {provider} API key · Run /settings</Text>;
              }
              return null;
            })()}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatScreen;
