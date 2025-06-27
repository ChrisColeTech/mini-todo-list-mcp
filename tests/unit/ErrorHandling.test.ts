/**
 * Error handling tests for AI-focused error messages
 */
import { createErrorResponseWithUsage } from '../../src/utils/formatters';

describe('Enhanced Error Handling for AI Agents', () => {
  describe('createErrorResponseWithUsage', () => {
    it('should create error response with parameter specifications', () => {
      const response = createErrorResponseWithUsage(
        'get-todo',
        'Todo with ID 999 not found',
        `Parameter required:
- id (number): The unique todo ID to retrieve

Example: get-todo with id: 5`
      );

      expect(response.isError).toBe(true);
      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('Error in get-todo: Todo with ID 999 not found');
      expect(response.content[0].text).toContain('Correct usage:');
      expect(response.content[0].text).toContain('Parameter required:');
      expect(response.content[0].text).toContain('- id (number): The unique todo ID to retrieve');
    });

    it('should format bulk-add-todos error with parameter specs', () => {
      const response = createErrorResponseWithUsage(
        'bulk-add-todos',
        'Folder path is required',
        `Parameters required:
- folderPath (string): Absolute path to folder containing files to process
- clearAll (boolean, optional): Whether to clear existing todos first (default: false)

Example: bulk-add-todos with folderPath: "/home/user/my-project", clearAll: false`
      );

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error in bulk-add-todos: Folder path is required');
      expect(response.content[0].text).toContain('Correct usage:');
      expect(response.content[0].text).toContain('Parameters required:');
      expect(response.content[0].text).toContain('- folderPath (string): Absolute path to folder');
      expect(response.content[0].text).toContain('- clearAll (boolean, optional)');
    });

    it('should format create-todo error with parameter specs', () => {
      const response = createErrorResponseWithUsage(
        'create-todo',
        'Title is required',
        `Parameters required:
- title (string): Brief task name
- description (string): Detailed task description  
- filePath (string, optional): Path to file to include content from

Example: create-todo with title: "Implement auth", description: "Add JWT authentication to login endpoint"`
      );

      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error in create-todo: Title is required');
      expect(response.content[0].text).toContain('Correct usage:');
      expect(response.content[0].text).toContain('Parameters required:');
      expect(response.content[0].text).toContain('- title (string): Brief task name');
      expect(response.content[0].text).toContain('- description (string): Detailed task description');
    });
  });
});