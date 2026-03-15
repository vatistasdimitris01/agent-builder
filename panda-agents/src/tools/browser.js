import puppeteer from 'puppeteer';
import config from '../config/index.js';

let browser = null;
let page = null;

const execute = async ({ command, args }) => {
  try {
    if (!browser) {
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      page = await browser.newPage();
    }

    switch (command) {
      case 'navigate':
        await page.goto(args.url, { waitUntil: 'networkidle2' });
        return `Navigated to ${args.url}`;

      case 'getContent':
        const content = await page.evaluate(() => document.body.innerText);
        return content.substring(0, 5000); // Limit output

      case 'click':
        await page.click(args.selector);
        return `Clicked element ${args.selector}`;

      case 'type':
        await page.type(args.selector, args.text);
        return `Typed "${args.text}" into ${args.selector}`;
      
      case 'executeScript':
        const result = await page.evaluate((script) => {
          try {
            return eval(script);
          } catch (e) {
            return `Error: ${e.message}`;
          }
        }, args.script);
        return `Executed script. Result: ${result}`;

      case 'moveMouse':
        await page.mouse.move(args.x, args.y);
        return `Moved mouse to ${args.x}, ${args.y}`;
      
      case 'clickMouse':
        await page.mouse.click(args.x, args.y);
        return `Clicked mouse at ${args.x}, ${args.y}`;

      case 'screenshot':
        const path = `screenshot_${Date.now()}.png`;
        await page.screenshot({ path });
        return `Screenshot saved to ${path}`;

      case 'close':
        await browser.close();
        browser = null;
        page = null;
        return 'Browser closed.';

      default:
        return `Unknown command: ${command}`;
    }
  } catch (error) {
    return `Browser Error: ${error.message}`;
  }
};

export default {
  name: 'browserUse',
  description: 'Control a web browser to navigate, click, type, and capture content',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        enum: ['navigate', 'getContent', 'click', 'type', 'screenshot', 'close', 'executeScript', 'moveMouse', 'clickMouse'],
        description: 'Browser action to perform'
      },
      args: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to navigate to' },
          selector: { type: 'string', description: 'CSS selector for element interaction' },
          text: { type: 'string', description: 'Text to type' },
          script: { type: 'string', description: 'JavaScript code to execute' },
          x: { type: 'number', description: 'Mouse X coordinate' },
          y: { type: 'number', description: 'Mouse Y coordinate' }
        }
      }
    },
    required: ['command']
  },
  execute
};
