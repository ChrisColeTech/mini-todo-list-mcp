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

import {
  AddRulesSchema,
  GetRulesSchema
} from "./models/Rule.js";

// Import services
import { todoService } from "./services/TodoService.js";
import { ruleService } from "./services/RuleService.js";
import { databaseService } from "./services/DatabaseService.js";

// Import utilities
import { createSuccessResponse, createErrorResponse, createErrorResponseWithUsage, formatTodo } from "./utils/formatters.js";
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
      return createErrorResponseWithUsage(
        "create-todo",
        result.message,
        `Parameters required:
- title (string): Brief task name
- description (string): Detailed task description  
- filePath (string, optional): Path to file to include content from

Example: create-todo with title: "Implement auth", description: "Add JWT authentication to login endpoint"`
      );
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
      return createErrorResponseWithUsage(
        "get-todo",
        result.message,
        `Parameter required:
- id (number): The unique todo ID to retrieve

Example: get-todo with id: 5`
      );
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
      return createErrorResponseWithUsage(
        "update-todo",
        result.message,
        `Parameters required:
- id (number): The unique todo ID to update
- title (string, optional): New task title
- description (string, optional): New task description
Note: At least one of title or description must be provided

Example: update-todo with id: 3, title: "Updated task name", description: "New description"`
      );
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
      return createErrorResponseWithUsage(
        "complete-todo",
        result.message,
        `Parameter required:
- id (number): The unique todo ID to mark as completed

Example: complete-todo with id: 5`
      );
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
      return createErrorResponseWithUsage(
        "bulk-add-todos",
        result.message,
        `Parameters required:
- folderPath (string): Absolute path to folder containing files to process
- clearAll (boolean, optional): Whether to clear existing todos first (default: false)

Example: bulk-add-todos with folderPath: "/home/user/my-project", clearAll: false`
      );
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
 * Tool 10: Add rules from file
 */
server.tool(
  "add-rules",
  "Add rules by reading content from a file",
  {
    filePath: z.string().min(1, "File path is required"),
    clearAll: z.boolean().optional().default(false),
  },
  async ({ filePath, clearAll }) => {
    const result = await safeExecute(async () => {
      const validatedData = AddRulesSchema.parse({ filePath, clearAll });
      const createdRules = await ruleService.addRules(validatedData);
      
      const clearMessage = clearAll ? " (after clearing all existing rules)" : "";
      return {
        ruleCount: createdRules.length,
        summary: `Created ${createdRules.length} rule from ${filePath}${clearMessage}`
      };
    }, "Failed to add rules");

    if (result instanceof Error) {
      return createErrorResponseWithUsage(
        "add-rules",
        result.message,
        `Parameters required:
- filePath (string): Absolute path to file containing rule content
- clearAll (boolean, optional): Whether to clear existing rules first (default: false)

Example: add-rules with filePath: "/home/user/rules.txt", clearAll: false`
      );
    }

    const { ruleCount, summary } = result;
    return createSuccessResponse(`✅ ${summary}`);
  }
);

/**
 * Tool 11: Get rules
 */
server.tool(
  "get-rules",
  "Get all rules or a specific rule by ID",
  {
    id: z.number().int().positive("Invalid Rule ID").optional(),
  },
  async ({ id }) => {
    const result = await safeExecute(() => {
      const validatedData = GetRulesSchema.parse({ id });
      const rules = ruleService.getRules(validatedData);
      
      if (rules.length === 0) {
        if (id) {
          return `No rule found with ID ${id}`;
        } else {
          return "No rules found";
        }
      }

      if (id) {
        const rule = rules[0];
        return `**Rule ${rule.id}**
Created: ${rule.createdAt}
${rule.filePath ? `Source: ${rule.filePath}` : ''}

${rule.description}`;
      } else {
        return rules.map(rule => 
          `**Rule ${rule.id}**
Created: ${rule.createdAt}
${rule.filePath ? `Source: ${rule.filePath}` : ''}

${rule.description}
---`
        ).join('\n');
      }
    }, "Failed to get rules");

    if (result instanceof Error) {
      return createErrorResponseWithUsage(
        "get-rules",
        result.message,
        `Parameter optional:
- id (number, optional): The unique rule ID to retrieve. If not provided, returns all rules.

Examples: 
- get-rules (returns all rules)
- get-rules with id: 5 (returns rule with ID 5)`
      );
    }

    return createSuccessResponse(result);
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