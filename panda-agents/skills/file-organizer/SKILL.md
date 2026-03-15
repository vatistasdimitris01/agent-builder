# File Organizer

Description: A powerful skill to organize files and clean up directories.

Usage:
- command: "fileOrganizer"
  args:
    command: "organize" | "cleanup"
    directory: "/path/to/directory"

Examples:
- "Organize my Downloads folder" -> fileOrganizer.execute({ command: 'organize', args: { directory: 'Downloads' } })
- "Clean up empty folders in Projects" -> fileOrganizer.execute({ command: 'cleanup', args: { directory: 'Projects' } })
