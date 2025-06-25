/**
 * Todo.ts - Mini Version
 *
 * Core todo model and validation schemas for the mini MCP server.
 * Includes only the essential schemas for CRUD operations, bulk operations, and workflow.
 * Uses integer IDs for simplicity.
 */
import { z } from 'zod';
/**
 * Essential validation schemas for mini version
 */
// CRUD Operations
export const CreateTodoSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
});
export const GetTodoSchema = z.object({
    id: z.number().int().positive("Invalid Todo ID"),
});
export const UpdateTodoSchema = z.object({
    id: z.number().int().positive("Invalid Todo ID"),
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
});
export const CompleteTodoSchema = z.object({
    id: z.number().int().positive("Invalid Todo ID"),
});
export const DeleteTodoSchema = z.object({
    id: z.number().int().positive("Invalid Todo ID"),
});
// Bulk Operations
export const BulkAddTodosSchema = z.object({
    folderPath: z.string().min(1, "Folder path is required"),
});
/**
 * Factory function to create a new Todo with proper defaults
 * Note: ID will be set by the database auto-increment
 */
export function createTodo(data, filePath, taskNumber) {
    const now = new Date().toISOString();
    return {
        title: data.title,
        description: data.description,
        completed: false,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        filePath,
        status: 'New',
        taskNumber,
    };
}
