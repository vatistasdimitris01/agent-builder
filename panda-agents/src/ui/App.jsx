import React, { useState } from 'react';
import { Box, Text } from 'ink';
import ChatScreen from './components/ChatScreen.jsx';
import SettingsScreen from './components/SettingsScreen.jsx';
import SkillsScreen from './components/SkillsScreen.jsx';
import config from '../config/index.js';
import { getPandaArt } from './pandaArt.js';

const App = () => {
  const [activeScreen, setActiveScreen] = useState('chat');

  const handleCommand = (command) => {
    switch (command.toLowerCase()) {
      case '/settings':
        setActiveScreen('settings');
        break;
      case '/skills':
        setActiveScreen('skills');
        break;
      case '/chat':
        setActiveScreen('chat');
        break;
      case '/exit':
      case '/quit':
        process.exit(0);
        break;
      default:
        // Handle unknown command or pass to chat
        break;
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'chat':
        return <ChatScreen onCommand={handleCommand} />;
      case 'settings':
        return <SettingsScreen onBack={() => setActiveScreen('chat')} />;
      case 'skills':
        // Assuming SkillsScreen can also have a back button or we handle it via commands
        return (
          <Box flexDirection="column">
            <SkillsScreen />
            <Box marginTop={1}>
              <Text color="gray">Type /chat to go back</Text>
            </Box>
          </Box>
        );
      default:
        return <ChatScreen onCommand={handleCommand} />;
    }
  };

  const selectedModelId = config.get('selectedModelId');
  const models = config.get('models') || [];
  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];
  
  const modelName = selectedModel ? selectedModel.name : 'No Model Configured';
  const provider = selectedModel ? selectedModel.provider : 'None';
  const modelId = selectedModel ? selectedModel.model : 'None';

  return (
    <Box flexDirection="column" width="100%">
      {/* Top Welcome / Info Box */}
      <Box 
        borderStyle="round" 
        borderColor="#f47454" // approximate color from screenshot
        flexDirection="row"
        width="100%"
        marginBottom={1}
      >
        {/* Left Column: Title & Logo */}
        <Box flexDirection="column" width="40%" padding={1} borderStyle="single" borderColor="#f47454" borderTop={false} borderBottom={false} borderLeft={false}>
          <Box position="absolute" marginTop={-1} marginLeft={2}>
            <Text color="#f47454"> Panda Code v1.0.0 </Text>
          </Box>
          
          <Box flexDirection="column" alignItems="center" marginTop={1}>
            <Text bold>Welcome back!</Text>
            <Box marginY={1}>
              <Text color="#f47454" bold>
                {getPandaArt(config.get('artSize'))}
              </Text>
            </Box>
            <Text color="gray">{modelName} ({provider}/{modelId}) · API Usage Billing</Text>
            <Text color="gray">{process.cwd()}</Text>
          </Box>
        </Box>

        {/* Right Column: Tips & Activity */}
        <Box flexDirection="column" width="60%" padding={1}>
          <Text color="#f47454" bold>Tips for getting started</Text>
          <Text>Run <Text color="white" bold>/skills</Text> to manage your tools or <Text color="white" bold>/settings</Text> to configure API keys.</Text>
          
          <Box marginTop={1} borderStyle="single" borderColor="gray" borderLeft={false} borderRight={false} borderBottom={false} paddingTop={1}>
            <Text color="#f47454" bold>Recent activity</Text>
            <Text color="gray">No recent activity</Text>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box flexDirection="column" flexGrow={1}>
        {renderScreen()}
      </Box>
    </Box>
  );
};

export default App;
