# Computer Use

Description: A skill to view and control the computer environment. Can take screenshots, get screen resolution, open applications, and perform basic typing (macOS only).

Usage:
- command: "computerUse"
  args:
    command: "screenshot" | "getScreenSize" | "openApp" | "type"
    appName: "Application Name"
    text: "Text to type"

Examples:
- "Take a screenshot" -> computerUse.execute({ command: 'screenshot' })
- "Open Calculator" -> computerUse.execute({ command: 'openApp', args: { appName: 'Calculator' } })
- "Type 'Hello World'" -> computerUse.execute({ command: 'type', args: { text: 'Hello World' } })
