/**
 * Unit tests for TodoService
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { todoService } from '../../src/services/TodoService.js';
import { TestFixtures, mockTodos, dbHelpers, assertions } from '../test-utils.js';

describe('TodoService', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(process.cwd(), 'tests', 'temp', 'fixtures');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    await dbHelpers.clearDatabase();
  });

  describe('create', () => {
    it('should create a todo with title and description', async () => {
      const todo = await todoService.create(mockTodos.valid.title, mockTodos.valid.description);
      
      assertions.isNewTodo(todo);
      expect(todo.title).toBe(mockTodos.valid.title);
      expect(todo.description).toBe(mockTodos.valid.description);
      expect(todo.taskNumber).toBe(1);
      expect(todo.filePath).toBeNull();
    });

    it('should create todo with file content when filePath provided', async () => {
      const filePath = TestFixtures.copyFixtureToTemp('valid', 'sample.txt', tempDir);
      const expectedContent = TestFixtures.readFixture('valid', 'sample.txt');
      
      const todo = await todoService.create('Test with file', 'Base description', filePath);
      
      assertions.isNewTodo(todo);
      expect(todo.title).toBe('Test with file');
      expect(todo.description).toContain('Base description');
      expect(todo.description).toContain(expectedContent);
      expect(todo.filePath).toBe(filePath);
    });

    it('should auto-increment task numbers', async () => {
      const todo1 = await todoService.create('Todo 1', 'Description 1');
      const todo2 = await todoService.create('Todo 2', 'Description 2');
      const todo3 = await todoService.create('Todo 3', 'Description 3');
      
      expect(todo1.taskNumber).toBe(1);
      expect(todo2.taskNumber).toBe(2);
      expect(todo3.taskNumber).toBe(3);
    });

    it('should handle minimal input', async () => {
      const todo = await todoService.create(mockTodos.minimal.title, mockTodos.minimal.description);
      
      assertions.isNewTodo(todo);
      expect(todo.title).toBe('A');
      expect(todo.description).toBe('B');
    });

    it('should handle long input', async () => {
      const todo = await todoService.create(mockTodos.long.title, mockTodos.long.description);
      
      assertions.isNewTodo(todo);
      expect(todo.title).toBe(mockTodos.long.title);
      expect(todo.description).toBe(mockTodos.long.description);
    });

    it('should reject empty title', async () => {
      await expect(todoService.create('', 'Valid description'))
        .rejects.toThrow('Title cannot be empty');
    });

    it('should reject empty description', async () => {
      await expect(todoService.create('Valid title', ''))
        .rejects.toThrow('Description cannot be empty');
    });

    it('should reject whitespace-only title', async () => {
      await expect(todoService.create('   ', 'Valid description'))
        .rejects.toThrow('Title cannot be empty');
    });

    it('should reject whitespace-only description', async () => {
      await expect(todoService.create('Valid title', '   '))
        .rejects.toThrow('Description cannot be empty');
    });

    it('should reject non-existent file path', async () => {
      const nonExistentPath = join(tempDir, 'non-existent.txt');
      
      await expect(todoService.create('Test', 'Description', nonExistentPath))
        .rejects.toThrow('File not found');
    });
  });

  describe('getById', () => {
    it('should retrieve existing todo by ID', async () => {
      const created = await todoService.create(mockTodos.valid.title, mockTodos.valid.description);
      const retrieved = await todoService.getById(created.id);
      
      expect(retrieved).toEqual(created);
      assertions.isNewTodo(retrieved);
    });

    it('should throw error for non-existent ID', async () => {
      await expect(todoService.getById(99999))
        .rejects.toThrow('Todo not found');
    });

    it('should throw error for invalid ID types', async () => {
      await expect(todoService.getById(0))
        .rejects.toThrow('Invalid ID');
      
      await expect(todoService.getById(-1))
        .rejects.toThrow('Invalid ID');
    });
  });

  describe('update', () => {
    let todo: any;

    beforeEach(async () => {
      todo = await todoService.create(mockTodos.valid.title, mockTodos.valid.description);
    });

    it('should update title only', async () => {
      const newTitle = 'Updated Title';
      const updated = await todoService.update(todo.id, newTitle, undefined);
      
      assertions.isNewTodo(updated);
      expect(updated.title).toBe(newTitle);
      expect(updated.description).toBe(mockTodos.valid.description);
      expect(updated.updatedAt).not.toBe(todo.updatedAt);
    });

    it('should update description only', async () => {
      const newDescription = 'Updated description';
      const updated = await todoService.update(todo.id, undefined, newDescription);
      
      assertions.isNewTodo(updated);
      expect(updated.title).toBe(mockTodos.valid.title);
      expect(updated.description).toBe(newDescription);
      expect(updated.updatedAt).not.toBe(todo.updatedAt);
    });

    it('should update both title and description', async () => {
      const newTitle = 'Updated Title';
      const newDescription = 'Updated description';
      const updated = await todoService.update(todo.id, newTitle, newDescription);
      
      assertions.isNewTodo(updated);
      expect(updated.title).toBe(newTitle);
      expect(updated.description).toBe(newDescription);
      expect(updated.updatedAt).not.toBe(todo.updatedAt);
    });

    it('should reject updating non-existent todo', async () => {
      await expect(todoService.update(99999, 'New title', 'New description'))
        .rejects.toThrow('Todo not found');
    });

    it('should reject empty updates', async () => {
      await expect(todoService.update(todo.id))
        .rejects.toThrow('At least one field (title or description) must be provided');
    });

    it('should reject empty title update', async () => {
      await expect(todoService.update(todo.id, '', undefined))
        .rejects.toThrow('Title cannot be empty');
    });

    it('should reject empty description update', async () => {
      await expect(todoService.update(todo.id, undefined, ''))
        .rejects.toThrow('Description cannot be empty');
    });
  });

  describe('complete', () => {
    let todo: any;

    beforeEach(async () => {
      todo = await todoService.create(mockTodos.valid.title, mockTodos.valid.description);
    });

    it('should mark todo as completed', async () => {
      const completed = await todoService.complete(todo.id);
      
      assertions.isCompletedTodo(completed);
      expect(completed.id).toBe(todo.id);
      expect(completed.title).toBe(todo.title);
      expect(completed.description).toBe(todo.description);
    });

    it('should allow completing already completed todo', async () => {
      const firstComplete = await todoService.complete(todo.id);
      const secondComplete = await todoService.complete(todo.id);
      
      assertions.isCompletedTodo(secondComplete);
      expect(secondComplete.completedAt).toBe(firstComplete.completedAt);
    });

    it('should reject completing non-existent todo', async () => {
      await expect(todoService.complete(99999))
        .rejects.toThrow('Todo not found');
    });
  });

  describe('delete', () => {
    let todo: any;

    beforeEach(async () => {
      todo = await todoService.create(mockTodos.valid.title, mockTodos.valid.description);
    });

    it('should delete existing todo', async () => {
      const result = await todoService.delete(todo.id);
      
      expect(result).toBe(true);
      await expect(todoService.getById(todo.id))
        .rejects.toThrow('Todo not found');
    });

    it('should reject deleting non-existent todo', async () => {
      await expect(todoService.delete(99999))
        .rejects.toThrow('Todo not found');
    });
  });

  describe('getNext', () => {
    it('should return null when no todos exist', async () => {
      const next = await todoService.getNext();
      expect(next).toBeNull();
    });

    it('should return the first incomplete todo', async () => {
      const todos = await dbHelpers.createMultipleTodos(3);
      
      const next = await todoService.getNext();
      expect(next).toEqual(todos[0]);
    });

    it('should skip completed todos and return next incomplete', async () => {
      const todos = await dbHelpers.createMultipleTodos(3);
      await todoService.complete(todos[0].id);
      
      const next = await todoService.getNext();
      expect(next).toEqual(todos[1]);
    });

    it('should return null when all todos are completed', async () => {
      const todos = await dbHelpers.createMultipleTodos(3);
      for (const todo of todos) {
        await todoService.complete(todo.id);
      }
      
      const next = await todoService.getNext();
      expect(next).toBeNull();
    });
  });

  describe('getNextId', () => {
    it('should return null when no todos exist', async () => {
      const result = await todoService.getNextId();
      expect(result).toBeNull();
    });

    it('should return ID and task number of next incomplete todo', async () => {
      const todos = await dbHelpers.createMultipleTodos(3);
      
      const result = await todoService.getNextId();
      expect(result).toEqual({
        id: todos[0].id,
        taskNumber: todos[0].taskNumber
      });
    });

    it('should skip completed todos', async () => {
      const todos = await dbHelpers.createMultipleTodos(3);
      await todoService.complete(todos[0].id);
      
      const result = await todoService.getNextId();
      expect(result).toEqual({
        id: todos[1].id,
        taskNumber: todos[1].taskNumber
      });
    });
  });

  describe('clearAll', () => {
    it('should clear empty database', async () => {
      const count = await todoService.clearAll();
      expect(count).toBe(0);
    });

    it('should clear all todos and return count', async () => {
      await dbHelpers.createMultipleTodos(5);
      
      const count = await todoService.clearAll();
      expect(count).toBe(5);
      
      const next = await todoService.getNext();
      expect(next).toBeNull();
    });

    it('should reset task number sequence after clear', async () => {
      await dbHelpers.createMultipleTodos(3);
      await todoService.clearAll();
      
      const newTodo = await todoService.create('New todo', 'After clear');
      expect(newTodo.taskNumber).toBe(1);
    });
  });

  describe('bulkAdd', () => {
    it('should create todos from valid folder', async () => {
      const validFixturesDir = TestFixtures.getFixturePath('valid', '');
      
      const result = await todoService.bulkAdd(validFixturesDir);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach((todo, index) => {
        assertions.isNewTodo(todo);
        expect(todo.taskNumber).toBe(index + 1);
        expect(todo.filePath).toBeTruthy();
      });
    });

    it('should clear existing todos when clearAll is true', async () => {
      await dbHelpers.createMultipleTodos(3);
      const validFixturesDir = TestFixtures.getFixturePath('valid', '');
      
      const result = await todoService.bulkAdd(validFixturesDir, true);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].taskNumber).toBe(1); // Should start from 1 after clear
    });

    it('should append to existing todos when clearAll is false', async () => {
      const existingTodos = await dbHelpers.createMultipleTodos(2);
      const validFixturesDir = TestFixtures.getFixturePath('valid', '');
      
      const result = await todoService.bulkAdd(validFixturesDir, false);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].taskNumber).toBeGreaterThan(2); // Should continue from existing
    });

    it('should reject non-existent folder', async () => {
      const nonExistentPath = join(tempDir, 'non-existent-folder');
      
      await expect(todoService.bulkAdd(nonExistentPath))
        .rejects.toThrow('Folder not found');
    });

    it('should handle empty folder', async () => {
      const emptyDir = join(tempDir, 'empty');
      mkdirSync(emptyDir, { recursive: true });
      
      const result = await todoService.bulkAdd(emptyDir);
      expect(result).toEqual([]);
    });
  });
});