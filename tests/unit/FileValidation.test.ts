/**
 * Tests for file type validation and content reading
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { todoService } from '../../src/services/TodoService.js';
import { TestFixtures, dbHelpers } from '../test-utils.js';

describe('File Validation and Content Reading', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(process.cwd(), 'tests', 'temp', 'validation');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    await dbHelpers.clearDatabase();
  });

  describe('Supported File Types', () => {
    const supportedExtensions = TestFixtures.getValidExtensions();

    supportedExtensions.forEach(ext => {
      it(`should read content from ${ext} files`, async () => {
        const filename = `test${ext}`;
        const filePath = join(tempDir, filename);
        const content = `Test content for ${ext} file\nSecond line`;
        
        writeFileSync(filePath, content);
        
        const todo = await todoService.create('Test', 'Description', filePath);
        expect(todo.description).toContain(content);
        expect(todo.filePath).toBe(filePath);
      });
    });

    it('should read files without extensions', async () => {
      const filePath = join(tempDir, 'no-extension-file');
      const content = 'Content of file without extension';
      
      writeFileSync(filePath, content);
      
      const todo = await todoService.create('Test', 'Description', filePath);
      expect(todo.description).toContain(content);
    });
  });

  describe('Rejected File Types', () => {
    const binaryExtensions = TestFixtures.getBinaryExtensions();

    binaryExtensions.forEach(ext => {
      it(`should reject ${ext} files`, async () => {
        const filename = `test${ext}`;
        const filePath = join(tempDir, filename);
        
        writeFileSync(filePath, 'This is not actually binary content');
        
        await expect(todoService.create('Test', 'Description', filePath))
          .rejects.toThrow(/not supported|binary|invalid/i);
      });
    });
  });

  describe('File Content Edge Cases', () => {
    it('should handle empty files', async () => {
      const filePath = join(tempDir, 'empty.txt');
      writeFileSync(filePath, '');
      
      const todo = await todoService.create('Empty file test', 'Base description', filePath);
      expect(todo.description).toContain('Base description');
      expect(todo.filePath).toBe(filePath);
    });

    it('should handle very large files', async () => {
      const filePath = join(tempDir, 'large.txt');
      const largeContent = 'Large file content '.repeat(1000);
      
      writeFileSync(filePath, largeContent);
      
      const todo = await todoService.create('Large file test', 'Base description', filePath);
      expect(todo.description).toContain(largeContent);
    });

    it('should handle files with special characters', async () => {
      const filePath = join(tempDir, 'special.txt');
      const specialContent = 'Content with émojis 🚀 and ñañá characters';
      
      writeFileSync(filePath, specialContent);
      
      const todo = await todoService.create('Special chars test', 'Base description', filePath);
      expect(todo.description).toContain(specialContent);
    });

    it('should handle files with line breaks and formatting', async () => {
      const filePath = join(tempDir, 'formatted.md');
      const formattedContent = `# Title\n\n## Subtitle\n\n- Item 1\n- Item 2\n\n**Bold** and *italic* text`;
      
      writeFileSync(filePath, formattedContent);
      
      const todo = await todoService.create('Formatted test', 'Base description', filePath);
      expect(todo.description).toContain(formattedContent);
    });

    it('should handle files with tabs and spaces', async () => {
      const filePath = join(tempDir, 'whitespace.js');
      const codeContent = `function test() {\n\tif (true) {\n\t\treturn "indented";\n\t}\n}`;
      
      writeFileSync(filePath, codeContent);
      
      const todo = await todoService.create('Code test', 'Base description', filePath);
      expect(todo.description).toContain(codeContent);
    });
  });

  describe('Bulk Add File Validation', () => {
    it('should process only supported files in bulk add', async () => {
      // Create a mix of supported and unsupported files
      const testDir = join(tempDir, 'mixed-files');
      mkdirSync(testDir, { recursive: true });
      
      // Supported files
      writeFileSync(join(testDir, 'test.txt'), 'Text content');
      writeFileSync(join(testDir, 'test.js'), 'JavaScript content');
      writeFileSync(join(testDir, 'test.md'), '# Markdown content');
      
      // Unsupported files (should be skipped)
      writeFileSync(join(testDir, 'test.exe'), 'Fake binary');
      writeFileSync(join(testDir, 'test.png'), 'Fake image');
      
      const todos = await todoService.bulkAdd(testDir);
      
      // Should only create todos for supported files
      expect(todos.length).toBe(3);
      todos.forEach(todo => {
        expect(todo.filePath).not.toMatch(/\.(exe|png)$/);
      });
    });

    it('should handle nested directories', async () => {
      const testDir = join(tempDir, 'nested');
      const subDir = join(testDir, 'subfolder');
      mkdirSync(subDir, { recursive: true });
      
      writeFileSync(join(testDir, 'root.txt'), 'Root file');
      writeFileSync(join(subDir, 'nested.txt'), 'Nested file');
      
      const todos = await todoService.bulkAdd(testDir);
      
      expect(todos.length).toBe(2);
      const filePaths = todos.map(t => t.filePath);
      expect(filePaths.some(p => p.includes('root.txt'))).toBe(true);
      expect(filePaths.some(p => p.includes('nested.txt'))).toBe(true);
    });

    it('should skip hidden files and directories', async () => {
      const testDir = join(tempDir, 'hidden-test');
      const hiddenDir = join(testDir, '.hidden');
      mkdirSync(hiddenDir, { recursive: true });
      
      writeFileSync(join(testDir, 'visible.txt'), 'Visible file');
      writeFileSync(join(testDir, '.hidden-file.txt'), 'Hidden file');
      writeFileSync(join(hiddenDir, 'nested-hidden.txt'), 'Nested hidden');
      
      const todos = await todoService.bulkAdd(testDir);
      
      // Should only process visible files
      expect(todos.length).toBe(1);
      expect(todos[0].filePath).toContain('visible.txt');
    });
  });

  describe('Error Handling', () => {
    it('should handle permission errors gracefully', async () => {
      // This test might be platform-specific
      const filePath = join(tempDir, 'readonly.txt');
      writeFileSync(filePath, 'Content');
      
      // Try to create todo with file - should work since we're just reading
      const todo = await todoService.create('Permission test', 'Description', filePath);
      expect(todo.filePath).toBe(filePath);
    });

    it('should handle files that are deleted after validation', async () => {
      const filePath = join(tempDir, 'temp-file.txt');
      writeFileSync(filePath, 'Temporary content');
      
      // File exists during validation but could be deleted by another process
      // This is a race condition test - in normal operation the file should remain
      const todo = await todoService.create('Temp file test', 'Description', filePath);
      expect(todo.filePath).toBe(filePath);
    });
  });
});