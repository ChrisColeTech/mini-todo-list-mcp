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

1. **Install globally:**
   ```bash
   npm install -g mini-todo-list-mcp
   ```

2. **Add to Claude Desktop config:**
   ```json
   {
     "mcpServers": {
       "mini-todo": {
         "command": "node",
         "args": ["/path/to/node_modules/mini-todo-list-mcp/dist/index.js"]
       }
     }
   }
   ```

3. **Start using in Claude:**
   - "Create a todo to implement user authentication"
   - "Use bulk-add-todos to create tasks from all files in /my/project"
   - "Get my next task to work on"

## Core Tools

| Tool | Purpose | Example Usage |
|------|---------|---------------|
| `create-todo` | Create single task | Create todo for bug fix with detailed description |
| `bulk-add-todos` | Create tasks from folder | Read all project files and create review tasks |
| `get-next-todo` | Get next task to work on | Returns lowest numbered incomplete task |
| `complete-todo` | Mark task as done | Mark task 5 as completed with timestamp |
| `update-todo` | Modify existing task | Add progress notes to existing task |
| `get-todo` | Get specific task details | View full details of task 3 |
| `delete-todo` | Remove task permanently | Delete outdated or duplicate task |
| `clear-all-todos` | Start fresh | Remove all tasks and reset numbering |
| `get-next-todo-id` | Get next task ID and number | Quick way to get ID for completion |

## Example Workflows

**Sequential Task Processing:**
1. `bulk-add-todos` → Create tasks from project folder
2. `get-next-todo` → Get Task 1 
3. Work on task...
4. `complete-todo` → Mark Task 1 done
5. `get-next-todo` → Get Task 2
6. Repeat until all done

**Code Review:**
- Use `bulk-add-todos` with `/path/to/changed/files`
- Each task contains full file content for review
- Process systematically with `get-next-todo`

**Project Setup:**
- `clear-all-todos` → Start fresh
- `bulk-add-todos` → Create tasks from project modules
- Sequential development with automatic task numbering

## Why Mini Version?

- **40% fewer tools** than full version (9 vs 15)
- **Simple integer IDs** instead of UUIDs (1, 2, 3...)
- **Lower token usage** for better AI performance  
- **Focused functionality** on most-used operations
- **Same power** for core workflows with better speed

## Documentation

Full documentation with detailed examples: [GitHub Repository](https://github.com/yourusername/mini-todo-list-mcp)

## License

MIT