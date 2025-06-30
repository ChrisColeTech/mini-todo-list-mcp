# Orchestrator Rules

## Step 1: Load Task Files
```
bulk-add-todos with folderPath /home/user/tasks and clearAll true
```

## Step 2: Task Assignment Loop
1. Call get-next-todo-id
2. If you get a task ID, create CODE mode subtask using this template:

```
Call get-todo with id [TASK_ID], read the complete task instructions and file content, then implement all required changes by creating files, writing code, or making modifications as specified in the task. When the implementation is complete, call complete-todo with id [TASK_ID].
```

3. Wait for CODE mode to complete and report back
4. Repeat until get-next-todo-id returns "All todos have been completed"

## Your Role
- Coordinate only - do not implement code yourself
- Focus on task IDs and creating subtasks for CODE mode agents