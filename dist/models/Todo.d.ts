/**
 * Todo.ts - Mini Version
 *
 * Core todo model and validation schemas for the mini MCP server.
 * Includes only the essential schemas for CRUD operations, bulk operations, and workflow.
 * Uses integer IDs for simplicity.
 */
import { z } from 'zod';
/**
 * Core Todo interface - using integer IDs for simplicity
 */
export interface Todo {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    filePath?: string;
    status: 'New' | 'Done';
    taskNumber?: number;
}
/**
 * Essential validation schemas for mini version
 */
export declare const CreateTodoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
}, {
    title: string;
    description: string;
}>;
export declare const GetTodoSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const UpdateTodoSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: number;
    title?: string | undefined;
    description?: string | undefined;
}, {
    id: number;
    title?: string | undefined;
    description?: string | undefined;
}>;
export declare const CompleteTodoSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const DeleteTodoSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
export declare const BulkAddTodosSchema: z.ZodObject<{
    folderPath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    folderPath: string;
}, {
    folderPath: string;
}>;
/**
 * Factory function to create a new Todo with proper defaults
 * Note: ID will be set by the database auto-increment
 */
export declare function createTodo(data: z.infer<typeof CreateTodoSchema>, filePath?: string, taskNumber?: number): Omit<Todo, 'id'>;
