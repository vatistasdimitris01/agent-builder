import React from 'react';
import { Text } from 'ink';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

// Configure marked with terminal renderer
marked.setOptions({
  renderer: new TerminalRenderer({
    reflowText: true,
    width: 80, 
    showSectionPrefix: false,
    unescape: true,
    emoji: true,
    tab: 2
  })
});

const Markdown = ({ children }) => {
  if (!children) return null;
  
  // marked returns a string with ANSI codes
  const content = marked(children);
  
  // Ink's Text component handles the ANSI string correctly
  return <Text>{content}</Text>;
};

export default Markdown;
