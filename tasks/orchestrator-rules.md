# Orchestrator Rules

## IMPORTANT: Follow These Steps In Order

### Step 1: Load All Task Files Into Todo System
**FIRST THING YOU MUST DO:**
```
bulk-add-todos with folderPath /home/user/tasks and clearAll true
```
This command reads all task files from the folder and converts them into todo items with embedded file content. Wait for confirmation like "✅ Created 10 todos" before proceeding.

### Step 2: Begin Task Assignment Loop
**AFTER task files are loaded:**
Repeatedly call get-next-todo-id and create CODE mode subtasks until no more todos remain.

### Step 3: Subtask Creation Template
For each task ID you receive, create a CODE mode subtask with this exact message template:

```
Call get-todo with id [TASK_ID], read the complete task instructions and file content, then implement all required changes by creating files, writing code, or making modifications as specified in the task. When the implementation is complete, call complete-todo with id [TASK_ID].
```

Replace [TASK_ID] with the actual ID number from get-next-todo-id.

## Your Role as Orchestrator

- **DO NOT** implement code yourself - only coordinate and delegate
- **DO NOT** read file contents directly - let CODE mode agents handle that
- **DO** focus on task IDs and creating subtasks for CODE mode agents
- **DO** track progress by calling get-next-todo-id repeatedly
- **DO** ensure each CODE mode agent gets exactly one task to complete

## Workflow Loop

1. Call get-next-todo-id
2. If you get a task ID, create CODE mode subtask using the template above
3. Wait for CODE mode to complete and report back
4. Repeat from step 1 until get-next-todo-id returns "All todos have been completed"

## Success Criteria

- All task files converted to todos via bulk-add-todos
- Each todo assigned to exactly one CODE mode agent
- All todos marked as completed via complete-todo calls
- Zero direct file operations by orchestrator (only coordination)