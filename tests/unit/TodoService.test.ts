/**
 * Unit tests for TodoService - Fixed API
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { todoService } from '../../src/services/TodoService.js';

describe('TodoService', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(process.cwd(), 'tests', 'temp', 'unit');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    todoService.clearAllTodos();
  });

  describe('createTodo', () => {
    it('should create a todo with title and description', () => {
      const todo = todoService.createTodo({
        title: 'Test Todo',
        description: 'Test description'
      });
      
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('taskNumber');
      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Test description');
      expect(todo.status).toBe('New');
      expect(todo.taskNumber).toBe(1);
    });

    it('should create todo with file content', () => {
      const filePath = join(tempDir, 'test.txt');
      writeFileSync(filePath, 'File content here');
      
      const todo = todoService.createTodo({
        title: 'File Todo',
        description: 'Base description',
        filePath: filePath
      });
      
      expect(todo.description).toContain('File content here');
      expect(todo.filePath).toBe(filePath);
    });
  });

  describe('getTodo', () => {
    it('should retrieve a todo by ID', () => {
      const created = todoService.createTodo({
        title: 'Test Todo',
        description: 'Test description'
      });
      
      const retrieved = todoService.getTodo(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Test Todo');
    });

    it('should return undefined for non-existent ID', () => {
      const result = todoService.getTodo(99999);
      expect(result).toBeUndefined();
    });
  });

  describe('updateTodo', () => {
    it('should update a todo', () => {
      const created = todoService.createTodo({
        title: 'Original Title',
        description: 'Original description'
      });
      
      const updated = todoService.updateTodo({
        id: created.id,
        title: 'Updated Title',
        description: 'Updated description'
      });
      
      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.description).toBe('Updated description');
    });
  });

  describe('completeTodo', () => {
    it('should complete a todo', () => {
      const created = todoService.createTodo({
        title: 'Todo to Complete',
        description: 'Will be completed'
      });
      
      const completed = todoService.completeTodo(created.id);
      expect(completed).toBeDefined();
      expect(completed?.status).toBe('Done');
      expect(completed?.completedAt).toBeDefined();
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', () => {
      const created = todoService.createTodo({
        title: 'Todo to Delete',
        description: 'Will be deleted'
      });
      
      const deleted = todoService.deleteTodo(created.id);
      expect(deleted).toBe(true);
      
      const retrieved = todoService.getTodo(created.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getNextTodo', () => {
    it('should get next todo in sequence', () => {
      const todo1 = todoService.createTodo({
        title: 'First Todo',
        description: 'Task 1'
      });
      
      todoService.createTodo({
        title: 'Second Todo',
        description: 'Task 2'
      });
      
      const next = todoService.getNextTodo();
      expect(next).toBeDefined();
      expect(next?.id).toBe(todo1.id);
    });

    it('should return undefined when no todos exist', () => {
      const next = todoService.getNextTodo();
      expect(next).toBeUndefined();
    });
  });

  describe('getNextTodoId', () => {
    it('should get next todo ID and task number', () => {
      todoService.createTodo({
        title: 'Test Todo',
        description: 'For ID test'
      });
      
      const result = todoService.getNextTodoId();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('taskNumber');
      expect(result?.taskNumber).toBe(1);
    });

    it('should return null when no todos exist', () => {
      const result = todoService.getNextTodoId();
      expect(result).toBeNull();
    });
  });

  describe('bulkAddTodos', () => {
    it('should create todos from folder contents', async () => {
      todoService.clearAllTodos(); // Ensure clean state
      
      const bulkDir = join(tempDir, 'bulk-test');
      mkdirSync(bulkDir, { recursive: true });
      
      writeFileSync(join(bulkDir, 'task1.txt'), 'Content of task 1');
      writeFileSync(join(bulkDir, 'task2.md'), '# Task 2\nMarkdown content');
      
      const todos = await todoService.bulkAddTodos({
        folderPath: bulkDir,
        clearAll: false
      });
      
      expect(todos).toHaveLength(2);
      todos.forEach((todo, index) => {
        expect(todo.taskNumber).toBe(index + 1);
        expect(todo.filePath).toBeTruthy();
      });
    });
  });

  describe('clearAllTodos', () => {
    it('should clear all todos', () => {
      todoService.createTodo({ title: 'Todo 1', description: 'Desc 1' });
      todoService.createTodo({ title: 'Todo 2', description: 'Desc 2' });
      
      const clearedCount = todoService.clearAllTodos();
      expect(clearedCount).toBe(2);
      
      const next = todoService.getNextTodo();
      expect(next).toBeUndefined();
    });
  });
});