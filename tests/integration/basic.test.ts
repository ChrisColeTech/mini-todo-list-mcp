/**
 * Basic integration tests for mini-todo-list-mcp
 * Tests the core TodoService functionality
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// Use require for CommonJS compatibility
const { todoService } = require('../../src/services/TodoService.js');

describe('Mini Todo List MCP - Basic Integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(process.cwd(), 'tests', 'temp', 'basic');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    // Clear all todos before each test
    todoService.clearAllTodos();
  });

  describe('Core CRUD Operations', () => {
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

    it('should retrieve a todo by ID', () => {
      const created = todoService.createTodo({
        title: 'Retrievable Todo',
        description: 'Can be retrieved'
      });
      
      const retrieved = todoService.getTodo(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Retrievable Todo');
      expect(retrieved?.id).toBe(created.id);
    });

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

  describe('Workflow Operations', () => {
    it('should get next todo in sequence', () => {
      const todo1 = todoService.createTodo({
        title: 'First Todo',
        description: 'Task 1'
      });
      
      const todo2 = todoService.createTodo({
        title: 'Second Todo', 
        description: 'Task 2'
      });
      
      const next = todoService.getNextTodo();
      expect(next).toBeDefined();
      expect(next?.id).toBe(todo1.id); // Should return first incomplete
      
      // Complete first, next should return second
      todoService.completeTodo(todo1.id);
      const nextAfterComplete = todoService.getNextTodo();
      expect(nextAfterComplete?.id).toBe(todo2.id);
    });

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

    it('should handle empty database for next todo', () => {
      const next = todoService.getNextTodo();
      expect(next).toBeUndefined();
      
      const nextId = todoService.getNextTodoId();
      expect(nextId).toBeNull();
    });
  });

  describe('File Content Integration', () => {
    it('should create todo with file content', () => {
      const filePath = join(tempDir, 'test-file.txt');
      const fileContent = 'This is test file content\nWith multiple lines';
      writeFileSync(filePath, fileContent);
      
      const todo = todoService.createTodo({
        title: 'File Todo',
        description: 'Base description',
        filePath: filePath
      });
      
      // File content replaces the base description in the TodoService implementation
      expect(todo.description).toContain(fileContent);
      expect(todo.filePath).toBe(filePath);
    });

    it('should handle various file types', () => {
      const testFiles = [
        { name: 'test.js', content: 'console.log("Hello World");' },
        { name: 'test.md', content: '# Markdown\nContent here' },
        { name: 'test.json', content: '{"key": "value"}' },
        { name: 'no-extension', content: 'Plain text content' }
      ];
      
      testFiles.forEach(({ name, content }) => {
        const filePath = join(tempDir, name);
        writeFileSync(filePath, content);
        
        const todo = todoService.createTodo({
          title: `Todo for ${name}`,
          description: 'File content test',
          filePath: filePath
        });
        
        expect(todo.description).toContain(content);
        expect(todo.filePath).toBe(filePath);
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should perform bulk add from folder', async () => {
      const bulkDir = join(tempDir, 'bulk-test');
      mkdirSync(bulkDir, { recursive: true });
      
      // Create test files
      writeFileSync(join(bulkDir, 'task1.txt'), 'Content of task 1');
      writeFileSync(join(bulkDir, 'task2.md'), '# Task 2\nMarkdown content');
      writeFileSync(join(bulkDir, 'task3.js'), 'console.log("Task 3");');
      
      const todos = await todoService.bulkAddTodos({
        folderPath: bulkDir,
        clearAll: false
      });
      
      expect(todos).toHaveLength(3);
      todos.forEach((todo: any, index: number) => {
        expect(todo.taskNumber).toBe(index + 1);
        expect(todo.filePath).toBeTruthy();
      });
    });

    it('should clear all todos', () => {
      // Create some todos
      todoService.createTodo({ title: 'Todo 1', description: 'Desc 1' });
      todoService.createTodo({ title: 'Todo 2', description: 'Desc 2' });
      todoService.createTodo({ title: 'Todo 3', description: 'Desc 3' });
      
      const clearedCount = todoService.clearAllTodos();
      expect(clearedCount).toBe(3);
      
      const next = todoService.getNextTodo();
      expect(next).toBeUndefined();
    });

    it('should handle bulk add with clearAll option', async () => {
      // Create existing todos
      todoService.createTodo({ title: 'Existing', description: 'Will be cleared' });
      
      const bulkDir = join(tempDir, 'clear-test');
      mkdirSync(bulkDir, { recursive: true });
      writeFileSync(join(bulkDir, 'new-task.txt'), 'New task content');
      
      const todos = await todoService.bulkAddTodos({
        folderPath: bulkDir,
        clearAll: true
      });
      
      expect(todos).toHaveLength(1);
      expect(todos[0].taskNumber).toBe(1); // Should start from 1 after clear
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent file', () => {
      expect(() => {
        todoService.createTodo({
          title: 'Bad File Todo',
          description: 'Test',
          filePath: '/non/existent/file.txt'
        });
      }).toThrow('File does not exist');
    });

    it('should handle non-existent todo ID', () => {
      const result = todoService.getTodo(99999);
      expect(result).toBeUndefined();
      
      const updateResult = todoService.updateTodo({
        id: 99999,
        title: 'New Title'
      });
      expect(updateResult).toBeUndefined();
    });

    it('should handle non-existent folder for bulk add', async () => {
      await expect(todoService.bulkAddTodos({
        folderPath: '/non/existent/folder'
      })).rejects.toThrow('Folder does not exist');
    });
  });

  describe('Task Numbering', () => {
    it('should auto-increment task numbers', () => {
      todoService.clearAllTodos(); // Clear any existing todos first
      
      const todo1 = todoService.createTodo({
        title: 'Task 1',
        description: 'First task'
      });
      
      const todo2 = todoService.createTodo({
        title: 'Task 2', 
        description: 'Second task'
      });
      
      const todo3 = todoService.createTodo({
        title: 'Task 3',
        description: 'Third task'
      });
      
      expect(todo1.taskNumber).toBe(1);
      expect(todo2.taskNumber).toBe(2);
      expect(todo3.taskNumber).toBe(3);
    });

    it('should reset task numbering after clear', () => {
      todoService.createTodo({ title: 'Task 1', description: 'First' });
      todoService.createTodo({ title: 'Task 2', description: 'Second' });
      
      todoService.clearAllTodos();
      
      const newTodo = todoService.createTodo({
        title: 'New Task 1',
        description: 'After clear'
      });
      
      expect(newTodo.taskNumber).toBe(1);
    });
  });
});