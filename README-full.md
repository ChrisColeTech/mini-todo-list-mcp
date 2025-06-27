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

## 🎯 Real Orchestrator + Agent Workflow (Roo Code/Cline)

**Step 1: Create task files first**

```
You create task files in /home/user/tasks/:
- task_1.md: "Create user authentication: Create 'app/src/auth/login.tsx' with verbatim content: [complete file content]..."
- task_2.md: "Create hooks: Create 'app/src/hooks/useElectron.tsx' with verbatim content: [complete file content]. Create 'app/src/hooks/useBrowser.tsx' with verbatim content: [complete file content]..."
- task_3.md: "Add API endpoints: Create 'app/src/api/users.ts' with verbatim content: [complete file content]..."
...etc for all planned work
```

**Step 2: User instruction:**

```
You: "Use bulk-add-todos with folderPath /home/user/tasks. Once loaded, call get-next-todo-id and create a subtask for CODE mode with the ID and instructions to call get-todo and complete the assigned todo. Repeat until no more todos."
```

**Step 3: Orchestrator execution:**

**Orchestrator calls:**
```
bulk-add-todos with folderPath /home/user/tasks
```

**MCP server returns:**
```
✅ Created 10 todos from files in /home/user/tasks
```

**Orchestrator calls:**
```
get-next-todo-id
```

**MCP server returns:**
```
ID: 1, Task Number: 1
```

**Orchestrator creates subtask using Cline/Roo Code built-in subtask system:**

```
SUBTASK assigned to CODE mode:
- Call get-todo with id 1
- Execute the task instructions received
- Call complete-todo with id 1 when finished
```

**CODE mode calls:**
```
get-todo with id 1
```

**MCP server returns:**

```
## Task 1: task_1 ⏳
**Source File:** /home/user/tasks/task_1.md

Create user authentication: Create 'app/src/auth/login.tsx' with verbatim content:

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;

**When completed, use the complete-todo MCP tool:**
- ID: 1
```

CODE mode creates the file exactly as specified, then calls:
```
complete-todo with id 1
```

**MCP server returns:**
```
✅ Task 1: task_1 completed
```

**Orchestrator calls:**
```
get-next-todo-id
```

**MCP server returns:**
```
ID: 2, Task Number: 2
```

**Orchestrator creates new subtask for CODE mode with id 2**
Process repeats through all task files...

**Final call:**

**Orchestrator calls:**
```
get-next-todo-id
```

**MCP server returns:**
```
All todos have been completed
```

Orchestrator stops - workflow finished.

### What's happening in this workflow:

The workflow starts when `bulk-add-todos` transforms the MCP server into the brains of the operation. It scans the task folder, reads every task file, and creates numbered todos with complete instructions embedded. The orchestrator doesn't need to remember what work needs to be done, doesn't need to track which tasks exist, and doesn't waste tokens managing task lists. One call loads everything.

When the orchestrator calls `get-next-todo-id`, it receives minimal coordination data like "ID: 1, Task Number: 1" instead of expensive full file content. The orchestrator doesn't need to store file content in context or remember what task comes next - the MCP server becomes the memory.

The orchestrator then creates simple, identical subtasks with the pattern "get todo 1, do work, complete todo 1." There are no complex instructions to remember, no file paths to track, and no context juggling. The CODE mode gets fresh, complete context via `get-todo` when needed.

When CODE mode calls `get-todo`, it receives the complete task with full work instructions and verbatim file content embedded. There's no "what should I create?" confusion, no incomplete specifications, and no lost requirements. Everything needed is delivered instantly.

The system provides automatic completion tracking when CODE mode calls `complete-todo`. The MCP server updates its internal state while the orchestrator doesn't track progress - the server handles that. The next `get-next-todo-id` call automatically returns the next incomplete task.

This approach delivers massive gains versus manual file management. The orchestrator context stays minimal with just coordination logic, while the server handles all file operations automatically. The server maintains state so agents don't need to remember progress. Token efficiency improves by 90% compared to full-content passing. Agents can't lose track, miss files, or get confused about progress, and each CODE mode subtask operates in perfect isolation with complete context.

The result is that the MCP server becomes the brains handling all complexity while agents are pure muscle executing simple, clear tasks. This approach is perfect for 3B+ models that get overwhelmed by file management and state tracking.

## 🎯 Alternative Direct Workflow

**Step 1: Create task files first**

```
You create task files in /home/user/component-tasks/:
- task_1.md: "Convert Header component to TypeScript: Update 'app/src/Header.jsx' - add proper prop interfaces, type all variables, ensure type safety. Current file: [complete existing file content]"
- task_2.md: "Convert Footer component to TypeScript: Update 'app/src/Footer.jsx' - add proper prop interfaces, type all variables, ensure type safety. Current file: [complete existing file content]"
...etc for all components
```

**Step 2: Load all task files**

```
You: "Use bulk-add-todos with folderPath /home/user/component-tasks to create tasks for TypeScript conversion."
```

**MCP server returns:** `✅ Created 15 todos from files in /home/user/component-tasks`

**Step 3: Get first task and provide specific instructions**

```
You: "Use get-next-todo to get the first conversion task. Follow the completion instructions when done."
```

**MCP server returns:**

```
## Task 1: task_1 ⏳
**Source File:** /home/user/component-tasks/task_1.md

Convert Header component to TypeScript: Update 'app/src/Header.jsx' - add proper prop interfaces, type all variables, ensure type safety. Current file:

import React from 'react';
import './Header.css';

const Header = ({ title, subtitle, onMenuClick, isMenuOpen, user }) => {
  return (
    <header className="main-header">
      <div className="header-content">
        <button
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className="header-titles">
          <h1>{title}</h1>
          {subtitle && <h2>{subtitle}</h2>}
        </div>

        <div className="user-section">
          {user ? (
            <div className="user-info">
              <img src={user.avatar} alt="User avatar" />
              <span>{user.name}</span>
            </div>
          ) : (
            <button className="login-btn">Login</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

**When completed, use the complete-todo MCP tool:**
- ID: 1
```

AI converts component to TypeScript, then calls `complete-todo with id 1`

**Step 4: Continue with clear instructions**

```
You: "Use get-next-todo to get the next conversion task. Follow the same TypeScript conversion pattern. Complete the todo when finished."
```

**MCP server returns:** Next task with embedded content and existing file
AI converts component, calls `complete-todo with id 2`

**Step 5: Repeat with consistent instructions**

```
You: "Continue this pattern - use get-next-todo, convert to TypeScript with proper types, complete the todo. Repeat until all components are converted."
```

**What's happening in this workflow:**

This workflow demonstrates the same brain function where the MCP server reads all task files and creates todos with embedded work instructions and file content. You don't manually track what needs to be done, copy/paste requirements, or manage task lists because one command loads everything.

The `get-next-todo` call delivers immediate efficiency unlike the orchestrator workflow. You get the full task content immediately as the MCP server delivers complete work instructions plus existing file content. No separate `get-todo` call is needed because everything comes in one response.

Each task includes embedded completion instructions with the exact ID, providing a significant advantage. The AI doesn't need to remember IDs and doesn't need to ask "what's the ID for this task?" because the task itself provides the completion path.

Human guidance integration creates the best of both worlds. You provide specific technical direction like "add interfaces, type variables" while the MCP server handles the mechanical parts including file content, progress tracking, and task sequencing.

The system provides automatic progress management when the AI completes a task and the MCP server updates internally. The next `get-next-todo` call automatically serves the next file. You don't track "did we do Header.jsx yet?" because the server knows.

Context optimization delivers significant benefits as the AI's context contains only current task content, not all 47 files. There's no context bloat, no confusion about which file to work on, and no "scroll up to find the file content" problems.

The gains versus manual file management are substantial. The server delivers content automatically so there's never a "please show me the file" request. The server tracks what's done so the agent never loses place. Each task provides a clean slate with complete context, eliminating pollution. Tasks include their own completion instructions, removing ID management burden. This creates consistent quality with the same task structure and completion pattern for all 47 files. Human oversight guides the work while the server handles the logistics.

The result is that the MCP server becomes the brains providing perfect task delivery and progress tracking. You provide the strategy and technical guidance while the AI serves as the muscle executing with complete, clean context every time. This approach is ideal for complex work requiring human direction but automated file management.

## 🎯 Why This Works for All AI Models

**Designed for smaller models (7B, 8B, 3B Instruct) that struggle with:**

- Reading folders and listing files
- Keeping task lists in memory
- Tracking progress as tasks are completed
- Complex tool calling for file operations

**But also dramatically improves larger models by:**

- Eliminating manual file copy/paste workflows
- Providing systematic task progression
- Maintaining perfect context across long sessions
- Reducing token usage and cognitive overhead

**The MCP Solution:**

- ✅ **Automatic file operations** - Server reads folders, parses files, creates tasks
- ✅ **Persistent workflow memory** - Server tracks all progress, never loses state
- ✅ **Simple tool interface** - AI just calls tools, server does all the work
- ✅ **Embedded context** - Full file content delivered in each response

**Result:** Both smaller and larger AI models work more efficiently, make fewer mistakes, and maintain focus on actual tasks instead of housekeeping.

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
