# Mini Todo List MCP

A streamlined Model Context Protocol (MCP) server for todo management with essential CRUD operations, bulk functionality, and workflow support.

## Quick Install

```bash
npm install mini-todo-list-mcp
```

## What is MCP?

Model Context Protocol (MCP) lets AI assistants like Claude connect to external tools and data sources. This server provides todo management capabilities directly in your AI conversations.

## Features

✅ **Essential CRUD operations** - Create, read, update, delete todos  
✅ **Bulk file processing** - Create todos from folder contents automatically  
✅ **Sequential workflow** - Get next task in numbered sequence  
✅ **File content embedding** - Read any text file directly into todo descriptions  
✅ **Simple integer IDs** - Easy to remember and communicate (1, 2, 3...)  
✅ **9 focused tools** - Streamlined for performance and lower token usage

## Supported File Types

The server can read content from **60+ file types** including:

**Code Files:** `.js`, `.ts`, `.py`, `.rb`, `.go`, `.java`, `.c`, `.cpp`, `.php`, `.swift`, `.kt`, `.rs`  
**Web Files:** `.html`, `.css`, `.scss`, `.xml`, `.svg`  
**Config Files:** `.json`, `.yaml`, `.toml`, `.env`, `.ini`  
**Documentation:** `.md`, `.txt`, `.rst`, `.tex`  
**Scripts:** `.sh`, `.ps1`, `.bat`, `.fish`  
**Data Files:** `.csv`, `.sql`, `.log`  
**And many more...**

Files without extensions are treated as plain text.

## Quick Setup

### Option 1: Global Install (Recommended)
```bash
npm install -g mini-todo-list-mcp
```

**Claude Desktop config:**
```json
{
  "mcpServers": {
    "mini-todo": {
      "command": "mini-todo-list-mcp"
    }
  }
}
```

### Option 2: Use with npx (No Installation)
**Claude Desktop config:**
```json
{
  "mcpServers": {
    "mini-todo": {
      "command": "npx",
      "args": ["mini-todo-list-mcp"]
    }
  }
}
```

### Option 3: Local Install
```bash
npm install mini-todo-list-mcp
```

**Claude Desktop config:**
```json
{
  "mcpServers": {
    "mini-todo": {
      "command": "node",
      "args": ["./node_modules/mini-todo-list-mcp/dist/index.js"]
    }
  }
}
```

## Start Using

Once configured, you can use these commands in Claude:
- "Create a todo to implement user authentication"
- "Use bulk-add-todos to create tasks from all files in /my/project"
- "Get my next task to work on"

## Core Tools

### 📝 Task Creation
| Tool | Purpose | How to Use |
|------|---------|------------|
| `create-todo` | Create single task | "Create a todo to fix login bug with OAuth integration details" |
| `bulk-add-todos` | Create tasks from folder | "Use bulk-add-todos to create tasks from all files in /my/project/src" |

### 🔍 Task Retrieval  
| Tool | Purpose | How to Use |
|------|---------|------------|
| `get-next-todo` | Get next task to work on | "Get my next task" or "What should I work on next?" |
| `get-todo` | Get specific task details | "Show me the details of todo 5" |
| `get-next-todo-id` | Get next task ID only | "What's the ID of my next task?" |

### ✏️ Task Management
| Tool | Purpose | How to Use |
|------|---------|------------|
| `update-todo` | Modify existing task | "Update todo 3 to add security requirements" |
| `complete-todo` | Mark task as done | "Mark todo 5 as completed" or "Complete task 5" |
| `delete-todo` | Remove task permanently | "Delete todo 7" |

### 🗂️ Bulk Operations
| Tool | Purpose | How to Use |
|------|---------|------------|
| `clear-all-todos` | Start fresh | "Clear all todos and start over" |

## Example Workflows

**Sequential Task Processing:**
1. "Use bulk-add-todos to create tasks from all files in /my/project"
2. "Get my next task" → Returns Task 1 with full details
3. Work on the task...
4. "Mark todo 1 as completed" 
5. "Get my next task" → Returns Task 2
6. Repeat until all done

**Code Review Workflow:**
1. "Use bulk-add-todos with folder /path/to/changed/files"
2. "What's my next task?" → Review first file with embedded content
3. "Complete task 1" → Mark review done
4. "Get next task" → Continue to next file

**Project Setup:**
1. "Clear all todos and start fresh"
2. "Create tasks from all files in /my/project/modules" 
3. "Show me task 1" → Start development with automatic numbering

## Why Mini Version?

- **40% fewer tools** than full version (9 vs 15)
- **Simple integer IDs** instead of UUIDs (1, 2, 3...)
- **Lower token usage** for better AI performance  
- **Focused functionality** on most-used operations
- **Same power** for core workflows with better speed

## Documentation

Full documentation with detailed examples: [GitHub Repository](https://github.com/ChrisColeTech/mini-todo-list-mcp)

## License

MIT