# Mini Todo List MCP Server

A streamlined Model Context Protocol (MCP) server for essential todo management with reduced token usage while maintaining core functionality. This mini version focuses on the most commonly used operations: CRUD actions, bulk operations, and sequential workflow.

## Features

### **Core Todo Management**
- **Create todos**: Add individual tasks with auto-assigned integer IDs and task numbers
- **Retrieve todos**: Get specific tasks by simple integer ID (no UUIDs)
- **Update todos**: Modify existing task titles and descriptions
- **Complete todos**: Mark tasks as done with completion timestamps
- **Delete todos**: Remove tasks permanently from the database

### **Bulk Operations & Workflow**
- **Bulk task creation**: Create multiple tasks by reading file contents directly from folders
- **Content-based tasks**: File contents become the task description automatically
- **Sequential workflow**: Get next task in numbered sequence for systematic processing  
- **Task numbering**: All tasks get sequential numbers (1, 2, 3...) for predictable ordering
- **Database management**: Clear all tasks for fresh starts

### **Streamlined Design**
- **9 essential tools** (vs 15 in full version) for reduced token usage
- **Integer IDs** (1, 2, 3...) instead of UUIDs for simplicity
- **Auto-assigned task numbers** for natural workflow progression
- **File content embedding** directly in task descriptions

## Tools Reference

This mini MCP server provides 9 essential tools optimized for core todo management workflows:

### **📋 Quick Reference Index**

| Tool | Purpose | Parameters |
|------|---------|------------|
| [`create-todo`](#1-create-todo---create-a-new-todo-with-auto-assigned-task-number) | Create single task with auto-assigned number | `title` (string, required, min 1 char), `description` (string, required, min 1 char), `filePath` (string, optional, reads file content) |
| [`get-todo`](#2-get-todo---get-a-specific-todo-by-id) | Retrieve specific task by integer ID | `id` (integer, required, must be positive) |
| [`update-todo`](#3-update-todo---update-a-todos-title-or-description) | Modify existing task content | `id` (integer, required), `title?` (string, optional, min 1 char), `description?` (string, optional, min 1 char) - **at least one of title/description required** |
| [`complete-todo`](#4-complete-todo---mark-a-todo-as-completed) | Mark task as done with timestamp | `id` (integer, required, must exist in database) |
| [`delete-todo`](#5-delete-todo---delete-a-todo) | Permanently remove task from database | `id` (integer, required, must exist in database) |
| [`get-next-todo`](#6-get-next-todo---get-the-next-task-to-work-on) | Get lowest numbered incomplete task | none |
| [`get-next-todo-id`](#7-get-next-todo-id---get-the-id-and-task-number-of-next-incomplete-task) | Get ID and task number of next incomplete task | none |
| [`bulk-add-todos`](#8-bulk-add-todos---create-multiple-tasks-from-folder-contents) | Create tasks by reading file contents from folder | `folderPath` (absolute path, required, must exist), `clearAll` (boolean, optional, default false) |
| [`clear-all-todos`](#9-clear-all-todos---delete-all-todos-from-the-database) | Delete entire task database (irreversible) | none |

**⚠️ Important Parameter Constraints:**
- **bulk-add-todos**: Simply provide a `folderPath` - the tool reads all file contents automatically. Set `clearAll` to `true` to clear all existing todos before adding new ones.
- **update-todo**: At least one of `title` or `description` must be provided (cannot update with no changes).
- **All file paths**: Must be absolute paths (starting with `/` on Unix or `C:\` on Windows), not relative paths.
- **Integer IDs**: All IDs are positive integers (1, 2, 3...), much simpler than UUIDs.

### **🎯 Workflow Examples**

#### **🔄 Sequential Task Processing** (Primary Workflow)
**User prompt:** *"Use bulk-add-todos to create tasks for all files in `/project/src/components` - the file contents will automatically become the task descriptions. Then use get-next-todo to work through them systematically one by one."*

Process tasks in numbered order with bulk creation:
1. [`bulk-add-todos`](#7-bulk-add-todos---create-multiple-tasks-from-folder-contents) → Create tasks from folder
2. [`get-next-todo`](#6-get-next-todo---get-the-next-task-to-work-on) → Get Task 1
3. [`complete-todo`](#4-complete-todo---mark-a-todo-as-completed) → Mark Task 1 done
4. [`get-next-todo`](#6-get-next-todo---get-the-next-task-to-work-on) → Get Task 2
5. Repeat steps 3-4 until all done

#### **📝 Individual Task Management**
**User prompt:** *"Use create-todo to create a task titled 'Fix payment gateway timeout' with description 'Investigate and fix 30-second timeout in Stripe integration. Check connection pooling and retry logic.' Then help me update it if needed and use complete-todo when done."*

Create and manage single tasks:
1. [`create-todo`](#1-create-todo---create-a-new-todo-with-auto-assigned-task-number) → Create single task (gets ID like 5)
2. [`update-todo`](#3-update-todo---update-a-todos-title-or-description) → Modify if needed
3. [`complete-todo`](#4-complete-todo---mark-a-todo-as-completed) → Mark done with ID 5

#### **🏗️ Project Setup Workflow**
**User prompt:** *"Use clear-all-todos to start fresh, then bulk-add-todos with folderPath '/new-project/modules' to read module files and create tasks automatically, then get-next-todo to start work."*

Setting up a new project with tasks:
1. [`clear-all-todos`](#8-clear-all-todos---delete-all-todos-from-the-database) → Start fresh
2. [`bulk-add-todos`](#7-bulk-add-todos---create-multiple-tasks-from-folder-contents) → Create from project files
3. [`get-next-todo`](#6-get-next-todo---get-the-next-task-to-work-on) → Begin work with Task 1

#### **🎯 Daily Work Routine**
**User prompt:** *"Use get-next-todo to see what I should work on first today. After completing work, use complete-todo with the task ID, then get-next-todo again to continue. Help me track progress through my workday."*

Typical daily workflow:
1. [`get-next-todo`](#6-get-next-todo---get-the-next-task-to-work-on) → Morning: get Task 3
2. Work on Task 3...
3. [`complete-todo`](#4-complete-todo---mark-a-todo-as-completed) → Mark Task 3 done
4. [`get-next-todo`](#6-get-next-todo---get-the-next-task-to-work-on) → Continue: get Task 4
5. Repeat throughout the day

## **🚀 Advanced Use Cases**

### **Code Review Workflow**
**User prompt:** *"Use bulk-add-todos with folderPath '/path/to/changed/files' to create review tasks. Each task will contain the full file content for review."*

**What it does:** Create code review tasks where each task contains the complete file content to review.

**How the mini MCP makes it better:**
- ✅ **Complete context**: Full file content embedded in each task
- ✅ **No file reading**: Review directly from task description
- ✅ **Sequential processing**: get-next-todo ensures systematic review order
- ✅ **Simple tracking**: Integer IDs (1, 2, 3) for clear progress

```xml
<!-- Create review tasks for all changed files -->
<invoke name="bulk-add-todos">
<parameter name="folderPath">/path/to/changed/files</parameter>
</invoke>

<!-- Process each file systematically -->
<invoke name="get-next-todo"></invoke>
<!-- Review the file content shown in the task description -->
<invoke name="complete-todo">
<parameter name="id">1</parameter>
</invoke>
```

### **Feature Development Pipeline**
**User prompt:** *"Use bulk-add-todos with folderPath '/features/user-auth/components' to create tasks for each component file. The existing component code will be in each task for reference."*

**What it does:** Break down feature development by creating tasks that contain the current component code for enhancement.

**How the mini MCP makes it better:**
- ✅ **Full context**: Current component code embedded in each task
- ✅ **No context switching**: See existing code while planning improvements
- ✅ **Easy tracking**: Integer IDs make it simple to discuss progress ("I'm working on task 7")
- ✅ **Parallel-ready**: Multiple developers can work on different components

```xml
<!-- Break down feature into component tasks -->
<invoke name="bulk-add-todos">
<parameter name="folderPath">/features/user-auth/components</parameter>
</invoke>

<!-- Start sequential development -->
<invoke name="get-next-todo"></invoke>
```

### **Learning/Training Workflow**
**User prompt:** *"Use bulk-add-todos with folderPath '/learning/react-tutorials' to create learning tasks. Each task will contain the full tutorial content for easy reference."*

**What it does:** Create learning tasks where each tutorial's content is embedded directly in the task description.

**How the mini MCP makes it better:**
- ✅ **Self-contained**: Full tutorial content in each task - no need to open files
- ✅ **Progressive mastery**: Sequential completion with integer ordering builds knowledge systematically
- ✅ **Simple tracking**: Easy to remember "I'm on tutorial 3 of 15"
- ✅ **Offline friendly**: Tutorial content embedded, no external file dependencies

```xml
<!-- Create systematic learning path -->
<invoke name="bulk-add-todos">
<parameter name="folderPath">/learning/react-tutorials</parameter>
</invoke>
```

---

## **📖 Individual Tool Documentation**

### **CRUD Operations**

#### 1. `create-todo` - Create a new todo with auto-assigned task number
Creates a single todo item with automatic integer ID assignment and task numbering. Can optionally read content from a file.

**Parameters:**
- `title` (string, required): The title of the todo (minimum 1 character)
- `description` (string, required): Detailed description in markdown format (minimum 1 character)
- `filePath` (string, optional): Absolute path to file - when provided, reads file content into task description

**Returns:** The newly created todo with integer ID and auto-assigned task number.

**Example (manual):**
```xml
<invoke name="create-todo">
<parameter name="title">Fix authentication bug</parameter>
<parameter name="description">Investigate and fix the login issue where users can't authenticate with OAuth providers. Check the JWT token validation logic and verify redirect URLs work correctly.</parameter>
</invoke>
```

**Example (from file):**
```xml
<invoke name="create-todo">
<parameter name="title">Review component</parameter>
<parameter name="description">Review and test this component</parameter>
<parameter name="filePath">/path/to/component.tsx</parameter>
</invoke>
```

#### 2. `get-todo` - Get a specific todo by ID
Retrieves the full details of a specific todo item using its integer ID.

**Parameters:**
- `id` (integer, required): The integer ID of the todo to retrieve (must be positive)

**Returns:** Complete todo details if found, error if not found.

**Example:**
```xml
<invoke name="get-todo">
<parameter name="id">5</parameter>
</invoke>
```

#### 3. `update-todo` - Update a todo's title or description
Modifies an existing todo's title and/or description while preserving other fields.

**Parameters:**
- `id` (integer, required): The integer ID of the todo to update
- `title` (string, optional): New title for the todo (minimum 1 character if provided)
- `description` (string, optional): New description for the todo (minimum 1 character if provided)

**Note:** At least one of `title` or `description` must be provided.

**Example:**
```xml
<invoke name="update-todo">
<parameter name="id">5</parameter>
<parameter name="title">Fix critical authentication bug</parameter>
<parameter name="description">**URGENT**: Investigate and fix the login issue where users can't authenticate with OAuth providers. Check JWT token validation logic, verify redirect URLs, and test with multiple OAuth providers including Google and GitHub.</parameter>
</invoke>
```

#### 4. `complete-todo` - Mark a todo as completed
Marks a todo as completed by setting both the completion timestamp and status to 'Done'.

**Parameters:**
- `id` (integer, required): The integer ID of the todo to mark as completed

**Returns:** The updated todo with completion timestamp.

**Example:**
```xml
<invoke name="complete-todo">
<parameter name="id">5</parameter>
</invoke>
```

#### 5. `delete-todo` - Delete a todo
Permanently removes a todo from the database.

**Parameters:**
- `id` (integer, required): The integer ID of the todo to delete

**Returns:** Success message with the deleted todo's title.

**Example:**
```xml
<invoke name="delete-todo">
<parameter name="id">5</parameter>
</invoke>
```

### **Workflow Operations**

#### 6. `get-next-todo` - Get the next task to work on
Returns the todo with the lowest task number that has status != 'Done', providing sequential workflow progression.

**Parameters:** None

**Returns:** The next incomplete todo, or message if no tasks remain.

**Example:**
```xml
<invoke name="get-next-todo">
</invoke>
```

#### 7. `get-next-todo-id` - Get the ID and task number of next incomplete task
Returns both the ID and task number of the next incomplete todo, or a completion message if all tasks are done.

**Parameters:** None

**Returns:** Either "ID: X, Task Number: Y" or "All todos have been completed"

**Use case:** Perfect for getting both the ID needed for `complete-todo` operations and the task number for reference, all in one call.

**Example:**
```xml
<invoke name="get-next-todo-id">
</invoke>
```

**Possible responses:**
- `"ID: 5, Task Number: 3"` (if todo with ID 5 and Task Number 3 is next)
- `"All todos have been completed"` (if no incomplete tasks remain)

### **Bulk Operations**

#### 8. `bulk-add-todos` - Create multiple tasks from folder contents
Recursively scans a folder and creates one todo per file by reading the file contents directly into the task description.

**Parameters:**
- `folderPath` (string, required): Absolute path to the folder to scan (must exist)
- `clearAll` (boolean, optional): If true, clears all existing todos before adding new ones (default: false)

**What it does:**
- Scans the folder recursively for all files
- Reads each file's content completely  
- Creates a task with the file content as the description
- Adds task metadata (task number, source file path, completion instructions)
- Uses the filename (without extension) in the task title

**Auto-injection:** Each task gets:
- Task number header (`**Task 1**`)
- Source file path (`**Source File:** /path/to/file`)
- Complete file content embedded in description
- Completion instructions with the integer ID

**Example:**
```xml
<invoke name="bulk-add-todos">
<parameter name="folderPath">/home/user/project/tasks</parameter>
</invoke>
```

**Example with clearAll:**
```xml
<invoke name="bulk-add-todos">
<parameter name="folderPath">/home/user/project/tasks</parameter>
<parameter name="clearAll">true</parameter>
</invoke>
```

**Result:** Creates tasks like:
```
## Task 1: my-task ⏳

**Task 1**
**Source File:** /home/user/project/tasks/my-task.md

[Complete file content from my-task.md appears here]

**When completed, use the complete-todo MCP tool:**
- ID: 1
```

#### 9. `clear-all-todos` - Delete all todos from the database
Removes all todos from the database and returns the count of deleted items. This operation is irreversible.

**Parameters:** None

**Returns:** Number of todos deleted.

**Example:**
```xml
<invoke name="clear-all-todos">
</invoke>
```

## **⚖️ Mini vs Full Version Comparison**

| Feature | Mini Version | Full Version | Benefit |
|---------|-------------|--------------|---------|
| **Number of Tools** | 9 essential tools | 15 comprehensive tools | 40% fewer tools = lower token usage |
| **ID Format** | Integer IDs (1, 2, 3...) | UUID strings | Simpler to use and remember |
| **CRUD Operations** | ✅ All essential | ✅ All + status updates | Same core functionality |
| **Bulk Operations** | ✅ Create + Clear | ✅ Create + Clear | Same bulk capabilities |
| **Workflow** | ✅ get-next-todo | ✅ get-next-todo | Same sequential processing |
| **Search Functions** | ❌ Not included | ✅ Title + Date search | Reduced complexity |
| **List Operations** | ❌ Not included | ✅ List all + active | Focused on workflow |
| **Summarization** | ❌ Not included | ✅ Active todo summaries | Streamlined output |
| **File Content System** | ✅ Direct file content embedding | ✅ Direct file content embedding | Same content power |
| **Auto-injection** | ✅ Task metadata injection | ✅ Task metadata injection | Same automation |
| **Duplicate Prevention** | ✅ Full validation | ✅ Full validation | Same data integrity |

### **When to Use Mini Version:**
- ✅ **Token optimization** - When you want lower context usage
- ✅ **Simple workflows** - Focus on core CRUD + bulk operations
- ✅ **Easy integration** - Fewer tools to learn and configure
- ✅ **Team coordination** - Simple integer IDs for communication
- ✅ **Performance** - Faster responses with reduced complexity

### **When to Use Full Version:**
- ✅ **Advanced search** - Need to find tasks by title or date
- ✅ **Complex organization** - Want list operations and summarization
- ✅ **Status management** - Need granular status updates beyond complete/incomplete
- ✅ **Comprehensive reporting** - Want detailed summaries and overviews

## **File Content System Deep Dive**

The mini version embeds complete file contents directly into task descriptions:

### **Content Auto-Injection**
File contents automatically get enhanced with metadata:
```markdown
**Task 3**
**Source File:** /path/to/file.js

[Complete file content from file.js appears here]

**When completed, use the complete-todo MCP tool:**
- ID: 3
```

### **Real-World Examples**

**Code File (component.tsx):**
```markdown
**Task 5**
**Source File:** /project/components/UserAuth.tsx

import React from 'react';
import { useState } from 'react';

export const UserAuth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  // ... rest of component code
};

**When completed, use the complete-todo MCP tool:**
- ID: 5
```

**Task File (requirements.md):**
```markdown
**Task 2**  
**Source File:** /project/tasks/api-integration.md

# API Integration Task

## Requirements
1. Implement REST API client
2. Add authentication handling
3. Create error boundary component
4. Add retry logic for failed requests

## Acceptance Criteria
- All endpoints working
- Error handling tested
- Documentation updated

**When completed, use the complete-todo MCP tool:**
- ID: 2
```

**Configuration File (config.json):**
```markdown
**Task 8**
**Source File:** /project/config/database.json

{
  "host": "localhost",
  "port": 5432,
  "database": "myapp",
  "ssl": false,
  "pool": {
    "min": 2,
    "max": 10
  }
}

**When completed, use the complete-todo MCP tool:**
- ID: 8
```

## Installation

```bash
# Clone the repository
git clone https://github.com/[username]/mini-todo-list-mcp.git
cd mini-todo-list-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Starting the Server

```bash
npm start
```

### Configuring with Claude for Desktop

#### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mini-todo": {
      "command": "node",
      "args": ["/absolute/path/to/mini-todo-list-mcp/dist/index.js"]
    }
  }
}
```

#### Cursor

- Go to "Cursor Settings" -> MCP
- Add a new MCP server with a "command" type
- Add the absolute path of the server and run it with node
- Example: node /absolute/path/to/mini-todo-list-mcp/dist/index.js

### Example Commands

When using with Claude for Desktop or Cursor, you can try:

#### **Individual Task Management**
- "Create a todo to implement user authentication with detailed OAuth setup steps"
- "Mark task 5 as completed"
- "Get the next task I should work on"
- "Update task 3 to add security requirements"

#### **Bulk Operations**
- "Create tasks for all files in /path/to/my/project - read each file's content into the task"
- "Use bulk-add-todos to create tasks from all files in /path/to/tasks folder"
- "Clear all todos and start fresh"

#### **Workflow Examples**
- "Get my next task" (returns Task 1, 2, 3... in sequence)
- "Complete task 7" (marks as done, next call returns Task 8)
- "Start with task 1 and work through systematically"

#### **File Content System**
The bulk operations automatically embed complete file contents:
```markdown
File content at /path/to/task.md:
# User Authentication Task
Implement OAuth2 integration with Google and GitHub.
Add proper error handling and token refresh.

Gets auto-expanded to:
**Task 5**
**Source File:** /path/to/task.md

# User Authentication Task
Implement OAuth2 integration with Google and GitHub.
Add proper error handling and token refresh.

**When completed, use the complete-todo MCP tool:**
- ID: 5
```

## Project Structure

This mini project follows the same clean separation of concerns as the full version:

```
src/
├── models/       # Data structures and validation schemas (simplified)
├── services/     # Business logic and database operations (essential methods only)
├── utils/        # Helper functions and formatters
├── config.ts     # Configuration settings (mini server branding)
├── index.ts      # Main entry point with 8 MCP tool definitions
```

## Learning from This Project

This mini project demonstrates:

1. **Token optimization** - How reducing tool count improves LLM performance
2. **Simplification strategies** - Using integers instead of UUIDs for better UX
3. **Core functionality focus** - Identifying the 20% of features that provide 80% of value
4. **Maintained compatibility** - Same template system and workflow patterns as full version

## Database Schema

The server uses SQLite with integer primary keys for simplicity:

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Simple integer IDs (1, 2, 3...)
  title TEXT NOT NULL,                   -- Task title
  description TEXT NOT NULL,             -- Markdown description (with auto-injected content for bulk tasks)
  completedAt TEXT NULL,                 -- ISO timestamp when completed
  createdAt TEXT NOT NULL,               -- ISO timestamp when created
  updatedAt TEXT NOT NULL,               -- ISO timestamp when last updated
  filePath TEXT NULL,                    -- Associated file path (for bulk tasks)
  status TEXT NOT NULL DEFAULT 'New',    -- Task status: 'New' or 'Done'
  taskNumber INTEGER NULL                -- Sequential task number for ordering
);
```

## Development

### Building

```bash
npm run build
```

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
# Test with a manual client (if available)
npm run test
```

## Key Features Deep Dive

### **Simple Integer IDs**
- All tasks get integer IDs (1, 2, 3...) instead of UUIDs
- Much easier to remember and communicate ("work on task 7")
- Simpler for team coordination and discussion
- Reduces cognitive load compared to UUID strings

### **Essential Tool Set**
- **CRUD Complete**: create, get, update, complete, delete
- **Workflow Focused**: get-next-todo for systematic progression
- **Bulk Powerful**: same template system as full version
- **Database Management**: clear-all for fresh starts

### **Template Auto-Injection**
Templates automatically get enhanced with:
- Task number header for clear identification
- File path reference for context
- Your custom instructions in the middle
- Completion instructions with the simple integer ID

### **Token Efficiency**
- **40% fewer tools** (9 vs 15) means significantly lower token usage
- **Simpler parameters** with integer IDs reduce context complexity
- **Focused functionality** eliminates rarely-used features
- **Same power** for core workflows with better performance

## Full vs Mini Decision Guide

### **Choose Mini Version When:**
- ✅ You primarily use CRUD operations and bulk task creation
- ✅ You want lower token usage and faster LLM responses
- ✅ You prefer simple integer IDs (1, 2, 3) over UUIDs
- ✅ You work in sequential workflows (get-next-todo pattern)
- ✅ You want easier team communication with simple task numbers
- ✅ You value simplicity and performance over comprehensive features

### **Choose Full Version When:**
- ✅ You need search functionality (by title, by date)
- ✅ You want list operations (list all, list active)
- ✅ You need summarization and reporting features
- ✅ You require granular status management beyond complete/incomplete
- ✅ You want comprehensive tool coverage for complex workflows
- ✅ Token usage is not a primary concern

### **Both Versions Provide:**
- ✅ Full template system with auto-injection
- ✅ Bulk task creation from folder contents
- ✅ Sequential workflow with task numbering
- ✅ Duplicate prevention and validation
- ✅ SQLite database with migration support
- ✅ Complete CRUD operations
- ✅ File path association for tasks

## License

MIT