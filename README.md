# Mini Todo List MCP

🚀 **Supercharge your AI agents** - This MCP server handles file reading, task tracking, and workflow management automatically. Designed for smaller AI models that get confused with file operations, but also dramatically improves larger models by eliminating manual file juggling.

## 🚀 Quick Start

### Install
```bash
npm install mini-todo-list-mcp
```

### Claude Desktop Config
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

### Try It
```
"Use bulk-add-todos with folderPath /my/project/tasks"
"Use get-next-todo"
```

## 🔧 Core Tools

| Tool | Purpose | Example |
|------|---------|---------|
| `bulk-add-todos` | Load tasks from folder | "Create tasks from /my/project/tasks" |
| `get-next-todo` | Get next task to work on | "What should I work on next?" |
| `get-next-todo-id` | Get next task ID only | "What's my next task ID?" |
| `get-todo` | Get specific task details | "Show me todo 5" |
| `create-todo` | Create single task | "Create todo to fix login bug" |
| `update-todo` | Modify existing task | "Update todo 3 with new requirements" |
| `complete-todo` | Mark task as done | "Complete task 5" |
| `delete-todo` | Remove task | "Delete todo 7" |
| `clear-all-todos` | Start fresh | "Clear all todos" |

## 🎯 Two Main Workflows

### 1. Orchestrator + Agent Pattern
Perfect for **Cline/Roo Code** automated workflows:

1. **Prepare:** Create task files with complete instructions
2. **Load:** `bulk-add-todos` reads all files and creates numbered tasks
3. **Orchestrate:** Orchestrator calls `get-next-todo-id` for minimal coordination
4. **Execute:** Agent calls `get-todo` for full context and completes work
5. **Repeat:** Automatic progression through all tasks

**Benefits:** Minimal token usage, perfect isolation, automated progress tracking

### 2. Direct Human-Guided Pattern
Ideal for **interactive work** with human oversight:

1. **Prepare:** Create task files with work instructions
2. **Load:** `bulk-add-todos` creates tasks with embedded file content
3. **Work:** `get-next-todo` provides complete task context
4. **Complete:** Follow embedded completion instructions
5. **Continue:** Repeat with human guidance

**Benefits:** Full context delivery, human direction, automated file management

## 🎯 Why This Works

**For smaller models (3B-8B):** Eliminates file operation confusion, provides clear task context

**For larger models:** Reduces token usage, eliminates manual file management, maintains focus

**For humans:** Provides oversight while automating the mechanical parts

## 🔧 File Processing

Automatically processes **60+ file types** including:
- **Code:** `.js`, `.ts`, `.py`, `.java`, `.cpp`, `.rs`, `.go`
- **Web:** `.html`, `.css`, `.scss`, `.xml`, `.svg`
- **Config:** `.json`, `.yaml`, `.env`, `.ini`
- **Docs:** `.md`, `.txt`, `.rst`
- **Scripts:** `.sh`, `.ps1`, `.bat`

## 📖 Documentation

- **[README-full.md](README-full.md)** - Complete documentation with detailed examples
- **[Installation Options](README-full.md#installation)** - Global install, npx usage
- **[Workflow Examples](README-full.md#workflows)** - Step-by-step examples with source code

## 🚀 Get Started

1. Install the package
2. Add to Claude Desktop config
3. Create task files with work instructions
4. Use `bulk-add-todos` to load everything
5. Use `get-next-todo` to start working

Let your AI focus on work, not file management.

---

## 📄 License

MIT