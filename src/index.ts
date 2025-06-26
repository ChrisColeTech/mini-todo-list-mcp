#!/usr/bin/env node
/**
 * index.ts - Mini Todo MCP Server
 * 
 * A streamlined version of the Todo MCP server with only essential tools:
 * - CRUD operations (create, get, update, complete, delete)
 * - Workflow (get-next-todo)
 * - Bulk operations (bulk-add-todos, clear-all-todos)
 * 
 * This mini version reduces token usage while maintaining core functionality.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import models and schemas
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  CompleteTodoSchema,
  DeleteTodoSchema,
  BulkAddTodosSchema
} from "./models/Todo.js";

// Import services
import { todoService } from "./services/TodoService.js";
import { databaseService } from "./services/DatabaseService.js";

// Import utilities
import { createSuccessResponse, createErrorResponse, formatTodo } from "./utils/formatters.js";
import { config } from "./config.js";

/**
 * Create the mini MCP server
 */
const server = new McpServer({
  name: config.server.name,
  version: config.server.version,
});

/**
 * Helper function to safely execute operations
 */
async function safeExecute<T>(operation: () => T | Promise<T>, errorMessage: string) {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    console.error(errorMessage, error);
    if (error instanceof Error) {
      return new Error(`${errorMessage}: ${error.message}`);
    }
    return new Error(errorMessage);
  }
}

/**
 * Tool 1: Create a new todo
 */
server.tool(
  "create-todo",
  "Create a new todo item with auto-assigned task number",
  {
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    filePath: z.string().min(1, "File path is required").optional(),
  },
  async ({ title, description, filePath }) => {
    const result = await safeExecute(() => {
      const validatedData = CreateTodoSchema.parse({ title, description, filePath });
      const newTodo = todoService.createTodo(validatedData);
      return `Todo ${newTodo.taskNumber}: ${newTodo.title}`;
    }, "Failed to create todo");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    return createSuccessResponse(`✅ Created ${result}`);
  }
);

/**
 * Tool 2: Get a specific todo by ID
 */
server.tool(
  "get-todo",
  "Get a specific todo by ID",
  {
    id: z.number().int().positive("Invalid Todo ID"),
  },
  async ({ id }) => {
    const result = await safeExecute(() => {
      const todo = todoService.getTodo(id);
      if (!todo) {
        throw new Error(`Todo with ID ${id} not found`);
      }
      return formatTodo(todo);
    }, "Failed to get todo");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    return createSuccessResponse(result);
  }
);

/**
 * Tool 3: Update a todo
 */
server.tool(
  "update-todo",
  "Update a todo title or description",
  {
    id: z.number().int().positive("Invalid Todo ID"),
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
  },
  async ({ id, title, description }) => {
    const result = await safeExecute(() => {
      const validatedData = UpdateTodoSchema.parse({ id, title, description });
      
      // Ensure at least one field is being updated
      if (!title && !description) {
        throw new Error("At least one field (title or description) must be provided");
      }

      const updatedTodo = todoService.updateTodo(validatedData);
      if (!updatedTodo) {
        throw new Error(`Todo with ID ${id} not found`);
      }

      return `Todo ${updatedTodo.taskNumber}: ${updatedTodo.title}`;
    }, "Failed to update todo");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    return createSuccessResponse(`✅ Updated ${result}`);
  }
);

/**
 * Tool 4: Complete a todo
 */
server.tool(
  "complete-todo",
  "Mark a todo as completed",
  {
    id: z.number().int().positive("Invalid Todo ID"),
  },
  async ({ id }) => {
    const result = await safeExecute(() => {
      const validatedData = CompleteTodoSchema.parse({ id });
      const completedTodo = todoService.completeTodo(validatedData.id);
      
      if (!completedTodo) {
        throw new Error(`Todo with ID ${id} not found`);
      }

      return `Todo ${completedTodo.taskNumber}: ${completedTodo.title}`;
    }, "Failed to complete todo");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    return createSuccessResponse(`✅ ${result} completed`);
  }
);

/**
 * Tool 5: Delete a todo
 */
server.tool(
  "delete-todo",
  "Delete a todo",
  {
    id: z.number().int().positive("Invalid Todo ID"),
  },
  async ({ id }) => {
    const result = await safeExecute(() => {
      const validatedData = DeleteTodoSchema.parse({ id });
      const todo = todoService.getTodo(validatedData.id);
      
      if (!todo) {
        throw new Error(`Todo with ID ${id} not found`);
      }
      
      const success = todoService.deleteTodo(validatedData.id);
      
      if (!success) {
        throw new Error(`Failed to delete todo with ID ${id}`);
      }
      
      return todo.title;
    }, "Failed to delete todo");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    return createSuccessResponse(`✅ Todo Deleted: "${result}"`);
  }
);

/**
 * Tool 6: Get next todo
 */
server.tool(
  "get-next-todo",
  "Get the next todo that needs to be completed (status != 'Done')",
  {},
  async () => {
    const result = await safeExecute(() => {
      const nextTodo = todoService.getNextTodo();
      
      if (!nextTodo) {
        return "No todos found that need to be completed.";
      }

      return formatTodo(nextTodo);
    }, "Failed to get next todo");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    return createSuccessResponse(result);
  }
);

/**
 * Tool 7: Get next todo ID and task number
 */
server.tool(
  "get-next-todo-id",
  "Get the ID and task number of the next incomplete todo",
  {},
  async () => {
    const result = await safeExecute(() => {
      const nextTodo = todoService.getNextTodoId();
      
      if (nextTodo === null) {
        return "All todos have been completed";
      }

      return `ID: ${nextTodo.id}, Task Number: ${nextTodo.taskNumber}`;
    }, "Failed to get next todo ID");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    return createSuccessResponse(result);
  }
);

/**
 * Tool 8: Bulk add todos
 */
server.tool(
  "bulk-add-todos",
  "Create todos by reading file contents from a folder (recursively scans all files)",
  {
    folderPath: z.string().min(1, "Folder path is required"),
    clearAll: z.boolean().optional().default(false),
  },
  async ({ folderPath, clearAll }) => {
    const result = await safeExecute(async () => {
      const validatedData = BulkAddTodosSchema.parse({ folderPath, clearAll });
      const createdTodos = await todoService.bulkAddTodos(validatedData);
      
      const clearMessage = clearAll ? " (after clearing all existing todos)" : "";
      return {
        todoCount: createdTodos.length,
        summary: `Created ${createdTodos.length} todos from files in ${folderPath}${clearMessage}`
      };
    }, "Failed to bulk add todos");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    const { todoCount, summary } = result;
    return createSuccessResponse(`✅ ${summary}`);
  }
);

/**
 * Tool 9: Clear all todos
 */
server.tool(
  "clear-all-todos",
  "Delete all todos from the database",
  {},
  async () => {
    const result = await safeExecute(() => {
      const deletedCount = todoService.clearAllTodos();
      return deletedCount;
    }, "Failed to clear all todos");

    if (result instanceof Error) {
      return createErrorResponse(result.message);
    }

    return createSuccessResponse(`✅ Cleared ${result} todos from the database.`);
  }
);

/**
 * Main function to start the server
 */
async function main() {
  console.error("Starting Mini Todo MCP Server...");
  console.error(`SQLite database path: ${config.db.path}`);
  
  try {
    // Set up graceful shutdown
    process.on('SIGINT', () => {
      console.error('Shutting down...');
      databaseService.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('Shutting down...');
      databaseService.close();
      process.exit(0);
    });
    
    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("Mini Todo MCP Server running on stdio transport");
  } catch (error) {
    console.error("Failed to start Mini Todo MCP Server:", error);
    databaseService.close();
    process.exit(1);
  }
}

// Start the server
main();