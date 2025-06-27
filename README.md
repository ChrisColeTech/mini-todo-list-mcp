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

## ✨ Core Commands

### 📋 Task Creation

| Command          | Parameters                                                                                                                                                                                                       | What It Does                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `create-todo`    | **title**: A short name for your task<br>**description**: What needs to be done<br>**filePath**: Path to a file to include its content (optional)                                                                | Creates one new task with a description of what needs to be done                                                |
| `bulk-add-todos` | **folderPath**: The complete path to the folder containing files you want converted into todos<br>**clearAll**: Set to `true` to delete existing tasks first, `false` to keep them (optional, defaults to false) | Scans the folder, reads every file, and creates numbered tasks with all the file content embedded automatically |

### 🔍 Task Retrieval

| Command         | Parameters                                                               | What It Does                                                                                                                 |
| --------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `get-next-todo` | No parameters needed                                                     | Gives you the next task that needs to be completed, with the full file content and clear instructions on how to mark it done |
| `get-todo`      | **id**: The unique identifier for the specific task you want to retrieve | Shows you the complete details of that one task, including any file content                                                  |

### ✏️ Task Management

| Command         | Parameters                                                                                                                                                                  | What It Does                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `update-todo`   | **id**: The unique identifier for the task to modify<br>**title**: New name for the task (optional)<br>**description**: New description of what needs to be done (optional) | Changes the information in an existing task (you must provide either a new title or description) |
| `complete-todo` | **id**: The unique identifier for the specific task                                                                                                                         | Marks that specific task as finished and removes it from your workflow queue                     |
| `delete-todo`   | **id**: The unique identifier for the task to remove permanently                                                                                                            | Completely removes that task from your list - this cannot be undone                              |

### 🔄 Bulk Operations

| Command           | Parameters           | What It Does                                                                  |
| ----------------- | -------------------- | ----------------------------------------------------------------------------- |
| `clear-all-todos` | No parameters needed | Deletes every single task from your list - use this to start completely fresh |

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

**Orchestrator calls:** `bulk-add-todos with folderPath /home/user/tasks`
**MCP server returns:** `✅ Created 10 todos from files in /home/user/tasks`

**Orchestrator calls:** `get-next-todo-id`
**MCP server returns:** `ID: 1, Task Number: 1`

\*\*Orchestrator creates subtask using Cline/Roo Code built-in subtask system:

```
SUBTASK assigned to CODE mode:
- Call get-todo with id 1
- Execute the task instructions received
- Call complete-todo with id 1 when finished
```

**CODE mode calls:** `get-todo with id 1`
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

CODE mode creates the file exactly as specified, then calls `complete-todo with id 1`
**MCP server returns:** `✅ Task 1: task_1 completed`

**Orchestrator calls:** `get-next-todo-id` again
**MCP server returns:** `ID: 2, Task Number: 2`

**Orchestrator creates new subtask for CODE mode with id 2**
Process repeats through all task files...

**Final call:** Orchestrator calls `get-next-todo-id`
**MCP server returns:** `All todos have been completed`
Orchestrator stops - workflow finished.

**What's happening in this workflow:**

**`bulk-add-todos` usage:** The MCP server becomes the brains - it scans the task folder, reads every task file, and creates numbered todos with complete instructions embedded. The orchestrator doesn't need to remember what work needs to be done, doesn't need to track which tasks exist, doesn't waste tokens managing task lists. One call, everything loaded.

**`get-next-todo-id` optimization:** Instead of the orchestrator getting full file content (expensive), it gets just "ID: 1, Task Number: 1" - minimal tokens for coordination. The orchestrator doesn't need to store file content in context or remember what task comes next. The MCP server is the memory.

**Subtask creation benefits:** The orchestrator creates simple, identical subtasks - "get todo 1, do work, complete todo 1." No complex instructions to remember, no file paths to track, no context juggling. The CODE mode gets fresh, complete context via `get-todo` when needed.

**`get-todo` power:** CODE mode calls this and receives the complete task with full work instructions and verbatim file content embedded. No "what should I create?" confusion, no incomplete specifications, no lost requirements. Everything needed is delivered instantly.

**Automatic completion tracking:** When CODE mode calls `complete-todo`, the MCP server updates its internal state. The orchestrator doesn't track progress - the server does. Next `get-next-todo-id` automatically returns the next incomplete task.

**Gains vs manual approach:**

- **No context bloat:** Orchestrator context stays minimal - just coordination logic
- **No file management:** Server handles all file operations automatically
- **No progress tracking:** Server maintains state, agents don't need to remember
- **Token efficiency:** 90% reduction in coordination tokens vs full-content passing
- **Error elimination:** Agents can't lose track, miss files, or get confused about progress
- **Perfect isolation:** Each CODE mode subtask is independent with complete context

**Result:** The MCP server is the brains handling all complexity. Agents are pure muscle executing simple, clear tasks. Perfect for 3B+ models that get overwhelmed by file management and state tracking.

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

**`bulk-add-todos` power:** Same brain function - MCP server reads all task files, creates todos with embedded work instructions and file content. You don't manually track what needs to be done, copy/paste requirements, or manage task lists. One command loads everything.

**`get-next-todo` efficiency:** Unlike the orchestrator workflow, you get the full task content immediately. The MCP server delivers complete work instructions plus existing file content. No separate `get-todo` call needed - everything in one response.

**Embedded instructions advantage:** Each task includes completion instructions with the exact ID. The AI doesn't need to remember IDs, doesn't need to ask "what's the ID for this task?" The task itself provides the completion path.

**Human guidance integration:** You provide specific technical direction ("add interfaces, type variables") while the MCP server handles the mechanical parts (file content, progress tracking, task sequencing). Best of both worlds.

**Automatic progress management:** When the AI completes a task, the MCP server updates internally. Next `get-next-todo` automatically serves the next file. You don't track "did we do Header.jsx yet?" - the server knows.

**Context optimization benefits:** The AI's context contains only current task content, not all 47 files. No context bloat, no confusion about which file to work on, no "scroll up to find the file content" problems.

**Gains vs manual file management:**

- **No file hunting:** Server delivers content automatically, never "please show me the file"
- **No progress confusion:** Server tracks what's done, agent never loses place
- **No context pollution:** Clean slate for each task with complete context provided
- **No ID management:** Task includes its own completion instructions
- **Consistent quality:** Same task structure and completion pattern for all 47 files
- **Human oversight:** You guide the work while server handles the logistics

**Result:** MCP server is the brains providing perfect task delivery and progress tracking. You provide the strategy and technical guidance. AI is the muscle executing with complete, clean context every time. Ideal for complex work requiring human direction but automated file management.

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
