import * as providers from '../providers/index.js';
import * as toolsModule from '../tools/index.js';
import { getSystemPrompt } from './systemPrompt.js';

export const run = async function* ({ messages, model, provider }) {
  let currentMessages = [...messages];
  
  // Ensure system prompt is present at the start
  const systemPrompt = getSystemPrompt();
  if (currentMessages.length > 0 && currentMessages[0].role === 'system') {
    // If there's already a system message (e.g. from Telegram integration), we prepend our global prompt
    currentMessages[0].content = `${systemPrompt}\n\n${currentMessages[0].content}`;
  } else {
    currentMessages.unshift({ role: 'system', content: systemPrompt });
  }

  let turnCount = 0;
  const maxTurns = 5;

  const availableTools = Object.values(toolsModule.registry);

  while (turnCount < maxTurns) {
    turnCount++;
    
    try {
      const stream = await providers.chat({
        messages: currentMessages,
        model,
        provider,
        stream: true,
        tools: availableTools
      });

      let fullResponse = '';
      let toolCalls = [];
      let currentToolCall = null;
      
      for await (const chunk of stream) {
        // Handle content
        let content = '';
        if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.content) {
          content = chunk.choices[0].delta.content;
        } else if (chunk.content) {
          content = chunk.content;
        }
        
        if (content) {
          fullResponse += content;
          yield { type: 'content', content };
        }

        // Handle tool calls (OpenAI specific structure mostly)
        if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.tool_calls) {
          const chunkToolCalls = chunk.choices[0].delta.tool_calls;
          
          for (const toolCallChunk of chunkToolCalls) {
            if (toolCallChunk.index !== undefined) {
              if (!toolCalls[toolCallChunk.index]) {
                toolCalls[toolCallChunk.index] = {
                  id: toolCallChunk.id || '',
                  type: 'function',
                  function: {
                    name: toolCallChunk.function?.name || '',
                    arguments: toolCallChunk.function?.arguments || ''
                  }
                };
              } else {
                if (toolCallChunk.id) toolCalls[toolCallChunk.index].id += toolCallChunk.id;
                if (toolCallChunk.function?.name) toolCalls[toolCallChunk.index].function.name += toolCallChunk.function.name;
                if (toolCallChunk.function?.arguments) toolCalls[toolCallChunk.index].function.arguments += toolCallChunk.function.arguments;
              }
            }
          }
        }
      }

      // Add assistant message to history
      const assistantMessage = { role: 'assistant', content: fullResponse || null };
      if (toolCalls.length > 0) {
        assistantMessage.tool_calls = toolCalls;
      }
      currentMessages.push(assistantMessage);

      // Execute tools if any
      if (toolCalls.length > 0) {
        yield { type: 'tool_start', count: toolCalls.length };
        
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name;
          const argsString = toolCall.function.arguments;
          let args = {};
          
          try {
            args = JSON.parse(argsString);
          } catch (e) {
            console.error('Failed to parse tool arguments:', argsString);
            yield { type: 'error', error: `Failed to parse arguments for tool ${toolName}` };
            continue;
          }

          yield { type: 'tool_executing', tool: toolName, args };

          let result;
          try {
            result = await toolsModule.execute(toolName, args);
          } catch (error) {
            result = `Error executing tool ${toolName}: ${error.message}`;
          }

          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolName,
            content: typeof result === 'string' ? result : JSON.stringify(result)
          });
          
          yield { type: 'tool_result', tool: toolName, result };
        }
        // Loop continues to process tool results
      } else {
        // No tool calls, we are done
        break;
      }

    } catch (error) {
      yield { type: 'error', error: error.message };
      break;
    }
  }
};

export default { run };
