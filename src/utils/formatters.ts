/**
 * formatters.ts - Mini Version
 * 
 * Utility functions for formatting data in the mini MCP application.
 */
import { Todo } from "../models/Todo.js";

/**
 * Format a todo item to a readable string representation
 */
export function formatTodo(todo: Todo): string {
  const statusEmoji = todo.completed ? '✅' : (todo.status === 'Done' ? '✅' : '⏳');
  const taskNumberPrefix = todo.taskNumber ? `Task ${todo.taskNumber}: ` : '';
  
  return `
## ${taskNumberPrefix}${todo.title} ${statusEmoji}

${todo.description}
  `.trim();
}

/**
 * Format a list of todos to a readable string representation
 */
export function formatTodoList(todos: Todo[]): string {
  if (todos.length === 0) {
    return "No todos found.";
  }

  const todoItems = todos.map(formatTodo).join('\n\n---\n\n');
  return `# Todo List (${todos.length} items)\n\n${todoItems}`;
}

/**
 * Create success response for MCP tool calls
 */
export function createSuccessResponse(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
  };
}

/**
 * Create error response for MCP tool calls
 */
export function createErrorResponse(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
    isError: true,
  };
}