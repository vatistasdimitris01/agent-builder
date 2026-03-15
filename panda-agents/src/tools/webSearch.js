import axios from 'axios';
import config from '../config/index.js';

const execute = async ({ query }) => {
  const tavilyKey = config.get('tavilyApiKey');
  
  if (tavilyKey) {
    try {
      const response = await axios.post('https://api.tavily.com/search', {
        api_key: tavilyKey,
        query,
        search_depth: "basic",
        include_answer: true,
        include_images: true, // Enable image search
        include_raw_content: false,
        max_results: 5,
      });
      return response.data;
    } catch (error) {
      console.error('Tavily search failed:', error.message);
      return `Search failed: ${error.message}`;
    }
  }

  return `[Mock Search Result] No Tavily API Key configured. Search query was: "${query}". Please run "panda setup" to configure search provider.`;
};

export default { 
  name: 'webSearch',
  description: 'Search the web for information',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The search query' }
    },
    required: ['query']
  },
  execute 
};
