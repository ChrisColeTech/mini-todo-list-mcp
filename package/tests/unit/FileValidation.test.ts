/**
 * File validation tests for TodoService - Fixed API
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { todoService } from '../../src/services/TodoService.js';

describe('FileValidation', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(process.cwd(), 'tests', 'temp', 'file-validation');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    todoService.clearAllTodos();
  });

  it('should handle valid text files', () => {
    const filePath = join(tempDir, 'test.txt');
    writeFileSync(filePath, 'This is test content');
    
    const todo = todoService.createTodo({
      title: 'Test',
      description: 'Description',
      filePath: filePath
    });
    
    expect(todo.description).toContain('This is test content');
    expect(todo.filePath).toBe(filePath);
  });

  it('should handle markdown files', () => {
    const filePath = join(tempDir, 'test.md');
    writeFileSync(filePath, '# Test Markdown\nContent here');
    
    const todo = todoService.createTodo({
      title: 'Test',
      description: 'Description',
      filePath: filePath
    });
    
    expect(todo.description).toContain('# Test Markdown');
    expect(todo.description).toContain('Content here');
  });

  it('should reject non-existent files', () => {
    const filePath = join(tempDir, 'nonexistent.txt');
    
    expect(() => {
      todoService.createTodo({
        title: 'Test',
        description: 'Description',
        filePath: filePath
      });
    }).toThrow('File does not exist');
  });

  it('should handle empty files', () => {
    const filePath = join(tempDir, 'empty.txt');
    writeFileSync(filePath, '');
    
    expect(() => {
      todoService.createTodo({
        title: 'Empty file test',
        description: 'Base description',
        filePath: filePath
      });
    }).toThrow('File is empty');
  });

  it('should handle large files', () => {
    const filePath = join(tempDir, 'large.txt');
    const largeContent = 'x'.repeat(10000);
    writeFileSync(filePath, largeContent);
    
    const todo = todoService.createTodo({
      title: 'Large file test',
      description: 'Base description',
      filePath: filePath
    });
    
    expect(todo.description).toContain(largeContent);
  });

  it('should handle files with special characters', () => {
    const filePath = join(tempDir, 'special.txt');
    writeFileSync(filePath, 'Special chars: éñ中文🚀');
    
    const todo = todoService.createTodo({
      title: 'Special chars test',
      description: 'Base description',
      filePath: filePath
    });
    
    expect(todo.description).toContain('Special chars: éñ中文🚀');
  });

  it('should handle JSON files', () => {
    const filePath = join(tempDir, 'test.json');
    writeFileSync(filePath, '{"key": "value", "number": 42}');
    
    const todo = todoService.createTodo({
      title: 'JSON test',
      description: 'Base description',
      filePath: filePath
    });
    
    expect(todo.description).toContain('"key": "value"');
    expect(todo.description).toContain('"number": 42');
  });

  it('should handle code files', () => {
    const filePath = join(tempDir, 'test.js');
    writeFileSync(filePath, 'function hello() {\n  console.log("Hello World");\n}');
    
    const todo = todoService.createTodo({
      title: 'Code test',
      description: 'Base description',
      filePath: filePath
    });
    
    expect(todo.description).toContain('function hello()');
    expect(todo.description).toContain('console.log("Hello World")');
  });

  it('should process multiple files in bulk', async () => {
    const testDir = join(tempDir, 'bulk');
    mkdirSync(testDir, { recursive: true });
    
    writeFileSync(join(testDir, 'file1.txt'), 'Content 1');
    writeFileSync(join(testDir, 'file2.md'), '# Content 2');
    writeFileSync(join(testDir, 'file3.js'), 'console.log("test");');
    
    const todos = await todoService.bulkAddTodos({
      folderPath: testDir,
      clearAll: false
    });
    
    expect(todos).toHaveLength(3);
    todos.forEach(todo => {
      expect(todo.filePath).toBeTruthy();
      expect(todo.description.length).toBeGreaterThan(0);
    });
  });

  it('should handle recursive directory structure', async () => {
    const testDir = join(tempDir, 'recursive');
    const nestedDir = join(testDir, 'nested');
    mkdirSync(nestedDir, { recursive: true });
    
    writeFileSync(join(testDir, 'root.txt'), 'Root content');
    writeFileSync(join(nestedDir, 'nested.txt'), 'Nested content');
    
    const todos = await todoService.bulkAddTodos({
      folderPath: testDir,
      clearAll: false
    });
    
    expect(todos).toHaveLength(2);
    const filePaths = todos.map(t => t.filePath);
    expect(filePaths.some(p => p?.includes('root.txt'))).toBe(true);
    expect(filePaths.some(p => p?.includes('nested.txt'))).toBe(true);
  });
});