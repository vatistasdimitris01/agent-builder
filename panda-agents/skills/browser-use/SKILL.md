# Browser Use

Description: A skill to browse the web, read content, click elements, and take screenshots using a headless browser.

Usage:
- command: "browserUse"
  args:
    command: "navigate" | "getContent" | "click" | "type" | "screenshot" | "close"
    url: "https://example.com"
    selector: "#id"
    text: "search query"

Examples:
- "Go to google.com" -> browserUse.execute({ command: 'navigate', args: { url: 'https://google.com' } })
- "Read the page content" -> browserUse.execute({ command: 'getContent' })
- "Search for 'Panda Agents'" -> browserUse.execute({ command: 'type', args: { selector: 'input[name="q"]', text: 'Panda Agents' } })
