/**
 * Error handling tests for enhanced error messages
 */
import { createErrorResponseWithUsage } from '../../src/utils/formatters';

describe('Enhanced Error Handling', () => {
  describe('createErrorResponseWithUsage', () => {
    it('should create error response with usage examples', () => {
      const response = createErrorResponseWithUsage(
        'get-todo',
        'Todo with ID 999 not found',
        '"Show me the details of todo 5" → get-todo with id: 5'
      );

      expect(response.isError).toBe(true);
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('❌ get-todo Error: Todo with ID 999 not found');
      expect(response.content[0].text).toContain('💡 Usage Example:');
      expect(response.content[0].text).toContain('"Show me the details of todo 5" → get-todo with id: 5');
    });

    it('should format bulk-add-todos error with usage', () => {
      const response = createErrorResponseWithUsage(
        'bulk-add-todos',
        'Folder path is required',
        '"Use bulk-add-todos to create tasks from all files in /home/user/my-project" → bulk-add-todos with folderPath: "/home/user/my-project", clearAll: false'
      );

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('❌ bulk-add-todos Error: Folder path is required');
      expect(response.content[0].text).toContain('💡 Usage Example:');
      expect(response.content[0].text).toContain('bulk-add-todos with folderPath: "/home/user/my-project"');
    });

    it('should format create-todo error with usage', () => {
      const response = createErrorResponseWithUsage(
        'create-todo',
        'Title is required',
        '"Create a todo to implement user authentication with JWT tokens"'
      );

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('❌ create-todo Error: Title is required');
      expect(response.content[0].text).toContain('💡 Usage Example:');
      expect(response.content[0].text).toContain('"Create a todo to implement user authentication with JWT tokens"');
    });
  });
});