# Mini Todo List MCP

🚀 **Supercharge your AI agents** - This MCP server handles file reading, task tracking, and workflow management automatically. **As a preliminary step, the work needs to be organized into task files** - this is essential for this tool and for having smaller AI models complete discrete units of work. Designed specifically for smaller AI models (7B, 8B, 3B Instruct) that get confused with file operations, but also dramatically improves the performance of larger models by eliminating manual file juggling.

## 🚀 Installation

### Option 1: Local Install (Recommended)

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

### Option 2: Global Install

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

### Option 3: Use with npx (No Installation)

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

## Core Tools

### 📝 Task Creation
| Tool | Parameters | Purpose |
|------|------------|--------|
| `create-todo` | `title` (required): Task name<br>`description` (required): Task details<br>`filePath` (optional): File to embed | Create single task |
| `bulk-add-todos` | `folderPath` (required): Directory to scan<br>`clearAll` (optional): Clear existing todos first | Create tasks from folder |

### 🔍 Task Retrieval  
| Tool | Parameters | Purpose |
|------|------------|--------|
| `get-next-todo` | No parameters | Get next task to work on |
| `get-todo` | `id` (required): Todo ID number | Get specific task details |
| `get-next-todo-id` | No parameters | Get next task ID only |

### ✏️ Task Management
| Tool | Parameters | Purpose |
|------|------------|--------|
| `update-todo` | `id` (required): Todo ID number<br>`title` (optional): New task name<br>`description` (optional): New task details | Modify existing task |
| `complete-todo` | `id` (required): Todo ID number | Mark task as done |
| `delete-todo` | `id` (required): Todo ID number | Remove task permanently |

### 🗂️ Bulk Operations
| Tool | Parameters | Purpose |
|------|------------|--------|
| `clear-all-todos` | No parameters | Start fresh |

## 🎯 Real Orchestrator + Agent Workflow (Roo Code/Cline)

### Setup
1. **You create task files** with complete instructions for each piece of work:
   
   See example task files: [/tasks/](https://github.com/ChrisColeTech/mini-todo-list-mcp/tree/main/tasks)

2. **You tell the orchestrator LLM**:
   ```
   "Use bulk-add-todos with folderPath /home/user/tasks. Then repeatedly call 
   get-next-todo-id and create CODE mode subtasks until no more todos."
   ```

### Execution Flow

**1. Orchestrator loads all tasks into MCP server**
- Orchestrator calls `bulk-add-todos` with folderPath: `/home/user/tasks`
- MCP server reads all task files and responds: `✅ Created 10 todos`

**2. Orchestrator gets next task ID for coordination** 
- Orchestrator calls `get-next-todo-id`
- MCP server responds with minimal data: `ID: 1, Task Number: 1`

**3. Orchestrator creates subtask using Cline/Roo Code built-in subtask system**
- Orchestrator uses Cline/Roo Code's subtask feature to create a new subtask assigned to CODE mode
- Subtask contains: "Call get-todo with id 1, execute the task instructions received, call complete-todo with id 1 when finished"
- This subtask is handed off to a separate CODE mode LLM instance

**4. CODE mode LLM executes the actual work**
- CODE mode LLM calls `get-todo` with id: 1  
- MCP server returns full todo item with embedded file content and detailed instructions
- CODE mode LLM creates the specified file exactly as instructed using the provided code
- CODE mode LLM calls `complete-todo` with id: 1
- MCP server responds: `✅ Task completed`

**5. Process repeats automatically**
- Orchestrator goes back to step 2 until MCP server returns "All todos completed"

### Key Benefits
- **Minimal tokens**: Orchestrator only gets task IDs for coordination, not full file content
- **No state tracking**: MCP server remembers all progress, LLMs don't need to track anything
- **Perfect isolation**: Each CODE mode subtask gets complete context without pollution
- **90% token reduction**: Compared to manual file management workflows

## 🎯 Alternative Direct Workflow

### Setup
1. **You create task files** with work instructions and existing file content:
   
   See example task files: [/tasks/](https://github.com/ChrisColeTech/mini-todo-list-mcp/tree/main/tasks)

2. **You give the LLM a single instruction to complete all work**:
   ```
   You: "Use bulk-add-todos with folderPath /home/user/component-tasks to load all tasks.
   Then call get-next-todo to get the first task, complete it, and continue calling 
   get-next-todo until the MCP server returns 'All todos have been completed'."
   ```

### Execution Flow

**1. LLM loads all tasks**
- LLM calls `bulk-add-todos` with folderPath: `/home/user/component-tasks`
- MCP server responds: `✅ Created 15 todos`

**2. LLM gets and works on each task automatically**  
- LLM calls `get-next-todo`
- MCP server returns full todo item with embedded file content and completion instructions
- LLM converts component to TypeScript following the task instructions
- LLM calls `complete-todo` with the ID provided in the task

**3. LLM continues automatically until done**
- LLM calls `get-next-todo` again
- MCP server returns next todo item or "All todos completed"
- Process repeats automatically until all components are converted

### Key Benefits
- **Full context delivery**: Each task includes complete file content and instructions
- **No ID management burden**: Tasks include their own completion instructions embedded
- **Human-LLM collaboration**: You provide technical direction while MCP server handles file logistics
- **Clean context per task**: LLM sees only current task content, not all 47 files simultaneously

## 🎯 Why This Works for All LLMs

**Designed for smaller LLMs (7B, 8B, 3B Instruct) that struggle with:**

- Reading folders and listing files
- Keeping task lists in memory
- Tracking progress as tasks are completed
- Complex tool calling for file operations

**But also dramatically improves larger LLMs by:**

- Eliminating manual file copy/paste workflows
- Providing systematic task progression
- Maintaining perfect context across long sessions
- Reducing token usage and cognitive overhead

**The MCP Solution:**

- ✅ **Automatic file operations** - MCP server reads folders, parses files, creates tasks
- ✅ **Persistent workflow memory** - MCP server tracks all progress, never loses state
- ✅ **Simple tool interface** - LLMs just call tools, MCP server does all the work
- ✅ **Embedded context** - Full file content delivered in each response

**Result:** Both smaller and larger LLMs work more efficiently, make fewer mistakes, and maintain focus on actual tasks instead of housekeeping.

## 🔧 File Processing Power

Automatically processes **60+ file types** including:

**Code Files:** `.js`, `.ts`, `.py`, `.rb`, `.go`, `.java`, `.c`, `.cpp`, `.php`, `.swift`, `.kt`, `.rs`  
**Web Files:** `.html`, `.css`, `.scss`, `.xml`, `.svg`  
**Config Files:** `.json`, `.yaml`, `.toml`, `.env`, `.ini`  
**Documentation:** `.md`, `.txt`, `.rst`, `.tex`  
**Scripts:** `.sh`, `.ps1`, `.bat`, `.fish`  
**Data Files:** `.csv`, `.sql`, `.log`

## 🚀 Get Started Now

Add to Claude Desktop config and try:

- "Use bulk-add-todos with folderPath /home/user/my-project"
- "Use get-next-todo"

Let your AI focus on work, not file management.

---

## 📄 License

MIT
