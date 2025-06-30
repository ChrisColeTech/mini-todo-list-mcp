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

### 📋 Rules Management
| Tool | Parameters | Purpose |
|------|------------|--------|
| `add-rules` | `filePath` (required): Path to rules file<br>`clearAll` (optional): Clear existing rules first | Reads entire file content and stores as single rule. Adds to existing rules unless clearAll=true |
| `get-rules` | `id` (optional): Specific rule ID | Returns all rules combined (no ID) or single rule (with ID) |

## 🎯 Real Orchestrator + Agent Workflow (Roo Code/Cline)

### Setup
1. **You create task files** with complete instructions for each piece of work:
   
   See example task files: [/tasks/](https://github.com/ChrisColeTech/mini-todo-list-mcp/tree/main/tasks)

2. **You create orchestrator rules file** that includes these key instructions:
   - Step 1: `bulk-add-todos with folderPath /home/user/tasks and clearAll true`
   - Step 2: Loop through `get-next-todo-id` and create CODE mode subtasks
   
   See complete example: [/tasks/orchestrator-rules.md](https://github.com/ChrisColeTech/mini-todo-list-mcp/blob/main/tasks/orchestrator-rules.md)

### Execution Flow

**Step 1: You give the orchestrator instruction**
```
"Use add-rules with filePath c:/path/to/orchestrator-rules.md and clearAll true, 
then use get-rules and follow the rules verbatim."
```

**Step 2: Orchestrator loads rules**
- Orchestrator calls `add-rules` with filePath: `c:/path/to/orchestrator-rules.md`, clearAll: true
- Orchestrator calls `get-rules` to retrieve workflow instructions

**Step 3: Orchestrator loads tasks**  
- Orchestrator calls `bulk-add-todos` with folderPath: `/home/user/tasks`, clearAll: true
- MCP server responds: `✅ Created 10 todos`

**Step 4: Orchestrator gets next task**
- Orchestrator calls `get-next-todo-id`
- MCP server responds: `ID: 1, Task Number: 1`

**Step 5: Orchestrator creates subtask**
- Orchestrator creates CODE mode subtask: "Call get-todo with id 1, read the complete task instructions and file content, then implement all required changes by creating files, writing code, or making modifications as specified in the task. When the implementation is complete, call complete-todo with id 1."
- Subtask is assigned to CODE mode LLM

**Step 6: CODE mode executes task**
- CODE mode calls `get-todo` with id: 1
- MCP server returns full todo item with embedded file content and detailed instructions
- CODE mode implements all required changes
- CODE mode calls `complete-todo` with id: 1
- CODE mode returns "subtask complete" to orchestrator

**Step 7: Loop repeats**
- Orchestrator calls `get-next-todo-id` again
- Process repeats until `get-next-todo-id` returns "All todos have been completed"

This orchestrator pattern works by having one LLM coordinate the overall project while specialized CODE agents handle the actual implementation. The orchestrator follows stored rules (via `get-rules`) to maintain consistent behavior and never sees file content—it only manages task IDs and creates subtasks. Each CODE agent gets complete context for one specific task and does the real work: writing code, creating files, implementing features, or refactoring components. This separation dramatically reduces token usage while ensuring perfect task isolation.

### Key Benefits
- **Rule-based consistency**: Orchestrator behavior stored in MCP server, retrieved with `get-rules`
- **Cognitive load isolation**: Orchestrator rules separate from agent task instructions  
- **Faster tool calling**: MCP tools faster than file reading, simpler than complex instructions
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
   "Use bulk-add-todos with folderPath /home/user/component-tasks. Then repeatedly call 
   get-next-todo, implement each todo's requirements by creating files and writing code, 
   then call complete-todo with the todo's ID. Repeat until no more todos."
   ```

### Execution Flow

**1. LLM loads all tasks**
- LLM calls `bulk-add-todos` with folderPath: `/home/user/component-tasks`
- MCP server responds: `✅ Created 15 todos`

**2. LLM gets full todo and implements it**  
- LLM calls `get-next-todo`
- MCP server returns full todo item with embedded file content and instructions
- LLM implements the todo by actually doing the required work: creating files, writing code, refactoring components, adding tests, or whatever the task specifies
- LLM calls `complete-todo` with the ID from the todo

**3. Process repeats automatically until done**
- LLM calls `get-next-todo` again
- MCP server returns next full todo item
- Process repeats until no more todos remain

This direct approach has one LLM handle the entire workflow from start to finish. The LLM loads all tasks, then systematically works through each one—getting the full task content, implementing the required changes by actually writing code and creating files, then marking it complete. This creates a clean, focused workflow where the LLM sees only one task at a time but maintains control over the entire process.

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
- ✅ **Rule-based orchestration** - Behavioral instructions stored and retrieved via `add-rules`/`get-rules`
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

**For Orchestrator + Agent Workflow:**
- "Use add-rules with filePath c:/path/to/orchestrator-rules.md and clearAll true, then use get-rules and follow the rules verbatim"

**For Direct Workflow:**
- "Use bulk-add-todos with folderPath /home/user/my-project"
- "Use get-next-todo"

Let your AI focus on work, not file management.

---

## 📄 License

MIT
