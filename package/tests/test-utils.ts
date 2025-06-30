/**
 * Test utilities for mini-todo-list-mcp tests
 */
import { join } from 'path';
import { readFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';

export class TestFixtures {
  private static readonly FIXTURES_DIR = join(__dirname, 'fixtures');

  /**
   * Get the absolute path to a fixture file
   */
  static getFixturePath(category: 'valid' | 'invalid' | 'binary', filename: string): string {
    return join(this.FIXTURES_DIR, category, filename);
  }

  /**
   * Copy a fixture file to a temporary test directory
   */
  static copyFixtureToTemp(category: 'valid' | 'invalid' | 'binary', filename: string, tempDir: string): string {
    const sourcePath = this.getFixturePath(category, filename);
    const destPath = join(tempDir, filename);
    
    // Ensure temp directory exists
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    
    copyFileSync(sourcePath, destPath);
    return destPath;
  }

  /**
   * Read fixture file content
   */
  static readFixture(category: 'valid' | 'invalid' | 'binary', filename: string): string {
    const fixturePath = this.getFixturePath(category, filename);
    return readFileSync(fixturePath, 'utf-8');
  }

  /**
   * Get all valid file extensions for testing
   */
  static getValidExtensions(): string[] {
    return [
      '.txt', '.text', '.md', '.markdown',
      '.js', '.mjs', '.ts', '.tsx', '.jsx',
      '.py', '.rb', '.go', '.rs', '.php',
      '.java', '.c', '.cpp', '.h', '.cs',
      '.swift', '.kt', '.scala',
      '.html', '.htm', '.css', '.scss', '.sass', '.less',
      '.xml', '.svg',
      '.json', '.yaml', '.yml', '.toml', '.ini',
      '.conf', '.config', '.env', '.properties',
      '.rst', '.tex', '.asciidoc', '.org',
      '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
      '.csv', '.tsv', '.sql', '.log'
    ];
  }

  /**
   * Get binary/rejected file extensions for testing
   */
  static getBinaryExtensions(): string[] {
    return [
      '.exe', '.app', '.deb', '.rpm', '.msi',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.tiff', '.webp',
      '.mp3', '.wav', '.mp4', '.avi', '.mov', '.mkv', '.flv',
      '.zip', '.tar', '.gz', '.rar', '.7z',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.class', '.jar', '.pyc', '.dll', '.so', '.dylib'
    ];
  }
}

/**
 * Mock todo data for testing
 */
export const mockTodos = {
  valid: {
    title: 'Test Todo',
    description: 'This is a test todo for unit testing'
  },
  withFile: {
    title: 'Todo with file',
    description: 'Todo created from file content',
    filePath: TestFixtures.getFixturePath('valid', 'sample.txt')
  },
  minimal: {
    title: 'A',
    description: 'B'
  },
  long: {
    title: 'Very long title '.repeat(10),
    description: 'Very long description '.repeat(50)
  }
};

/**
 * Database test helpers
 */
export const dbHelpers = {
  /**
   * Clear all todos from test database
   */
  clearDatabase() {
    const { todoService } = require('../src/services/TodoService.js');
    return todoService.clearAllTodos();
  },

  /**
   * Create a sample todo for testing
   */
  createSampleTodo(overrides: Partial<typeof mockTodos.valid> = {}) {
    const { todoService } = require('../src/services/TodoService.js');
    const todoData = { ...mockTodos.valid, ...overrides };
    return todoService.createTodo({
      title: todoData.title,
      description: todoData.description
    });
  },

  /**
   * Create multiple sample todos
   */
  createMultipleTodos(count: number = 3) {
    const { todoService } = require('../src/services/TodoService.js');
    const todos = [];
    for (let i = 1; i <= count; i++) {
      const todo = todoService.createTodo({
        title: `Test Todo ${i}`,
        description: `Description for todo ${i}`
      });
      todos.push(todo);
    }
    return todos;
  }
};

/**
 * Assertion helpers for testing
 */
export const assertions = {
  /**
   * Assert that a todo object has required properties
   */
  isTodo(obj: any): void {
    expect(obj).toHaveProperty('id');
    expect(obj).toHaveProperty('title');
    expect(obj).toHaveProperty('description');
    expect(obj).toHaveProperty('status');
    expect(obj).toHaveProperty('createdAt');
    expect(obj).toHaveProperty('updatedAt');
    expect(obj).toHaveProperty('taskNumber');
    expect(typeof obj.id).toBe('number');
    expect(typeof obj.title).toBe('string');
    expect(typeof obj.description).toBe('string');
    expect(['New', 'Done']).toContain(obj.status);
  },

  /**
   * Assert that a todo is in "New" status
   */
  isNewTodo(todo: any): void {
    this.isTodo(todo);
    expect(todo.status).toBe('New');
    expect(todo.completedAt).toBeNull();
  },

  /**
   * Assert that a todo is in "Done" status
   */
  isCompletedTodo(todo: any): void {
    this.isTodo(todo);
    expect(todo.status).toBe('Done');
    expect(todo.completedAt).not.toBeNull();
    expect(new Date(todo.completedAt)).toBeInstanceOf(Date);
  }
};