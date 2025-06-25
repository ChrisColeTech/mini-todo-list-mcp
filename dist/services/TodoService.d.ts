/**
 * TodoService.ts - Mini Version
 *
 * Core business logic for managing todos with only essential methods.
 * Includes: CRUD operations, bulk add, bulk clear, and get next todo.
 */
import { Todo, CreateTodoSchema, UpdateTodoSchema, BulkAddTodosSchema } from '../models/Todo.js';
import { z } from 'zod';
/**
 * TodoService Class - Mini Version
 * Only includes essential methods for the mini MCP server
 */
declare class TodoService {
    /**
     * Create a new todo
     */
    createTodo(data: z.infer<typeof CreateTodoSchema>, filePath?: string, taskNumber?: number): Todo;
    /**
     * Get a todo by ID
     */
    getTodo(id: number): Todo | undefined;
    /**
     * Update a todo
     */
    updateTodo(data: z.infer<typeof UpdateTodoSchema>): Todo | undefined;
    /**
     * Mark a todo as completed
     */
    completeTodo(id: number): Todo | undefined;
    /**
     * Delete a todo
     */
    deleteTodo(id: number): boolean;
    /**
     * Get next todo that is not marked as 'Done'
     */
    getNextTodo(): Todo | undefined;
    /**
     * Get next todo number only
     */
    getNextTodoNumber(): number | null;
    /**
     * Bulk add todos by reading file contents directly (optimized with parallel processing)
     */
    bulkAddTodos(data: z.infer<typeof BulkAddTodosSchema>): Promise<Todo[]>;
    /**
     * Clear all todos from the database
     */
    clearAllTodos(): number;
    /**
     * Helper to convert a database row to a Todo object
     */
    private rowToTodo;
    /**
     * Validate file paths for duplicate detection
     */
    private validateFilePaths;
    /**
     * Recursively get all files in a directory
     */
    private getAllFilesRecursively;
}
export declare const todoService: TodoService;
export {};
