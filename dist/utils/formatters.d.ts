/**
 * formatters.ts - Mini Version
 *
 * Utility functions for formatting data in the mini MCP application.
 */
import { Todo } from "../models/Todo.js";
/**
 * Format a todo item to a readable string representation
 */
export declare function formatTodo(todo: Todo): string;
/**
 * Format a list of todos to a readable string representation
 */
export declare function formatTodoList(todos: Todo[]): string;
/**
 * Create success response for MCP tool calls
 */
export declare function createSuccessResponse(message: string): {
    content: {
        type: "text";
        text: string;
    }[];
};
/**
 * Create error response for MCP tool calls
 */
export declare function createErrorResponse(message: string): {
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
};
