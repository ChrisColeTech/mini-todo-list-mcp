/**
 * Integration tests for MCP tools
 * These tests simulate how the MCP tools would be called by an LLM
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { todoService } from '../../src/services/TodoService.js';
import { TestFixtures, dbHelpers, assertions } from '../test-utils.js';

// Mock MCP tool request/response format
interface McpRequest {
  name: string;
  arguments: Record<string, any>;
}

interface McpResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

// Helper to simulate MCP tool execution
async function executeMcpTool(request: McpRequest): Promise<McpResponse> {
  try {
    let result: any;
    
    switch (request.name) {
      case 'create-todo':
        result = await todoService.create(
          request.arguments.title,
          request.arguments.description,
          request.arguments.filePath
        );
        return {
          content: [{ type: 'text', text: `Created todo: ${JSON.stringify(result, null, 2)}` }]
        };
        
      case 'get-todo':
        result = await todoService.getById(request.arguments.id);
        return {
          content: [{ type: 'text', text: `Todo details: ${JSON.stringify(result, null, 2)}` }]
        };
        
      case 'update-todo':
        result = await todoService.update(
          request.arguments.id,
          request.arguments.title,
          request.arguments.description
        );
        return {
          content: [{ type: 'text', text: `Updated todo: ${JSON.stringify(result, null, 2)}` }]
        };
        
      case 'complete-todo':
        result = await todoService.complete(request.arguments.id);
        return {
          content: [{ type: 'text', text: `Completed todo: ${JSON.stringify(result, null, 2)}` }]
        };
        
      case 'delete-todo':
        await todoService.delete(request.arguments.id);
        return {
          content: [{ type: 'text', text: `Successfully deleted todo` }]
        };
        
      case 'get-next-todo':
        result = await todoService.getNext();
        if (result) {
          return {
            content: [{ type: 'text', text: `Next todo: ${JSON.stringify(result, null, 2)}` }]
          };
        } else {
          return {
            content: [{ type: 'text', text: 'All todos have been completed' }]
          };
        }
        
      case 'get-next-todo-id':
        result = await todoService.getNextId();
        if (result) {
          return {
            content: [{ type: 'text', text: `ID: ${result.id}, Task Number: ${result.taskNumber}` }]
          };
        } else {
          return {
            content: [{ type: 'text', text: 'All todos have been completed' }]
          };
        }
        
      case 'bulk-add-todos':
        result = await todoService.bulkAdd(
          request.arguments.folderPath,
          request.arguments.clearAll || false
        );
        return {
          content: [{ 
            type: 'text', 
            text: `Created ${result.length} todos from folder contents` 
          }]
        };
        
      case 'clear-all-todos':
        result = await todoService.clearAll();
        return {
          content: [{ type: 'text', text: `Cleared ${result} todos` }]
        };
        
      default:
        throw new Error(`Unknown tool: ${request.name}`);
    }
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }],
      isError: true
    };
  }
}

describe('MCP Tools Integration', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(process.cwd(), 'tests', 'temp', 'mcp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    await dbHelpers.clearDatabase();
  });

  describe('create-todo tool', () => {
    it('should create todo with basic parameters', async () => {
      const request: McpRequest = {
        name: 'create-todo',
        arguments: {
          title: 'Test Todo',
          description: 'Test description'
        }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Created todo:');
      expect(response.content[0].text).toContain('Test Todo');
    });

    it('should create todo with file content', async () => {
      const filePath = TestFixtures.copyFixtureToTemp('valid', 'sample.txt', tempDir);
      const request: McpRequest = {
        name: 'create-todo',
        arguments: {
          title: 'Todo with file',
          description: 'Base description',
          filePath: filePath
        }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Todo with file');
      expect(response.content[0].text).toContain(filePath);
    });

    it('should return error for invalid parameters', async () => {
      const request: McpRequest = {
        name: 'create-todo',
        arguments: {
          title: '',
          description: 'Valid description'
        }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error:');
    });
  });

  describe('get-todo tool', () => {
    it('should retrieve existing todo', async () => {
      const todo = await dbHelpers.createSampleTodo();
      const request: McpRequest = {
        name: 'get-todo',
        arguments: { id: todo.id }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Todo details:');
      expect(response.content[0].text).toContain(todo.title);
    });

    it('should return error for non-existent todo', async () => {
      const request: McpRequest = {
        name: 'get-todo',
        arguments: { id: 99999 }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('not found');
    });
  });

  describe('update-todo tool', () => {
    it('should update todo title and description', async () => {
      const todo = await dbHelpers.createSampleTodo();
      const request: McpRequest = {
        name: 'update-todo',
        arguments: {
          id: todo.id,
          title: 'Updated Title',
          description: 'Updated Description'
        }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Updated todo:');
      expect(response.content[0].text).toContain('Updated Title');
      expect(response.content[0].text).toContain('Updated Description');
    });

    it('should return error when no fields provided', async () => {
      const todo = await dbHelpers.createSampleTodo();
      const request: McpRequest = {
        name: 'update-todo',
        arguments: { id: todo.id }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('at least one field');
    });
  });

  describe('complete-todo tool', () => {
    it('should mark todo as completed', async () => {
      const todo = await dbHelpers.createSampleTodo();
      const request: McpRequest = {
        name: 'complete-todo',
        arguments: { id: todo.id }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Completed todo:');
      expect(response.content[0].text).toContain('"status": "Done"');
      expect(response.content[0].text).toContain('completedAt');
    });
  });

  describe('delete-todo tool', () => {
    it('should delete existing todo', async () => {
      const todo = await dbHelpers.createSampleTodo();
      const request: McpRequest = {
        name: 'delete-todo',
        arguments: { id: todo.id }
      };

      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Successfully deleted');
    });
  });

  describe('workflow tools', () => {
    it('should handle get-next-todo workflow', async () => {
      const todos = await dbHelpers.createMultipleTodos(3);
      
      // Get first todo
      let request: McpRequest = {
        name: 'get-next-todo',
        arguments: {}
      };
      let response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain(todos[0].title);
      
      // Complete first todo
      request = {
        name: 'complete-todo',
        arguments: { id: todos[0].id }
      };
      await executeMcpTool(request);
      
      // Get next todo (should be second one)
      request = {
        name: 'get-next-todo',
        arguments: {}
      };
      response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain(todos[1].title);
    });

    it('should handle get-next-todo-id workflow', async () => {
      const todos = await dbHelpers.createMultipleTodos(2);
      
      const request: McpRequest = {
        name: 'get-next-todo-id',
        arguments: {}
      };
      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain(`ID: ${todos[0].id}`);
      expect(response.content[0].text).toContain(`Task Number: ${todos[0].taskNumber}`);
    });

    it('should return completion message when no todos remain', async () => {
      const request: McpRequest = {
        name: 'get-next-todo',
        arguments: {}
      };
      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('All todos have been completed');
    });
  });

  describe('bulk operations', () => {
    it('should handle bulk-add-todos', async () => {
      const testDir = join(tempDir, 'bulk-test');
      mkdirSync(testDir, { recursive: true });
      
      writeFileSync(join(testDir, 'task1.txt'), 'Content of task 1');
      writeFileSync(join(testDir, 'task2.md'), '# Task 2\nMarkdown content');
      writeFileSync(join(testDir, 'task3.js'), 'console.log("Task 3");');
      
      const request: McpRequest = {
        name: 'bulk-add-todos',
        arguments: {
          folderPath: testDir,
          clearAll: false
        }
      };
      
      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Created 3 todos');
    });

    it('should handle bulk-add-todos with clearAll', async () => {
      await dbHelpers.createMultipleTodos(2);
      
      const testDir = join(tempDir, 'bulk-clear-test');
      mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, 'new-task.txt'), 'New task content');
      
      const request: McpRequest = {
        name: 'bulk-add-todos',
        arguments: {
          folderPath: testDir,
          clearAll: true
        }
      };
      
      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Created 1 todos');
      
      // Verify that previous todos were cleared
      const nextRequest: McpRequest = {
        name: 'get-next-todo-id',
        arguments: {}
      };
      const nextResponse = await executeMcpTool(nextRequest);
      expect(nextResponse.content[0].text).toContain('Task Number: 1');
    });

    it('should handle clear-all-todos', async () => {
      await dbHelpers.createMultipleTodos(5);
      
      const request: McpRequest = {
        name: 'clear-all-todos',
        arguments: {}
      };
      
      const response = await executeMcpTool(request);
      
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Cleared 5 todos');
    });
  });

  describe('Error scenarios', () => {
    it('should handle unknown tool gracefully', async () => {
      const request: McpRequest = {
        name: 'unknown-tool',
        arguments: {}
      };
      
      const response = await executeMcpTool(request);
      
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Unknown tool');
    });

    it('should handle invalid file paths in bulk-add', async () => {
      const request: McpRequest = {
        name: 'bulk-add-todos',
        arguments: {
          folderPath: '/non/existent/path'
        }
      };
      
      const response = await executeMcpTool(request);
      
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error:');
    });
  });

  describe('Complete workflow scenarios', () => {
    it('should handle typical development workflow', async () => {
      // 1. Clear any existing todos
      await executeMcpTool({
        name: 'clear-all-todos',
        arguments: {}
      });
      
      // 2. Create project structure
      const projectDir = join(tempDir, 'project');
      mkdirSync(projectDir, { recursive: true });
      writeFileSync(join(projectDir, 'README.md'), '# Project\nSetup instructions');
      writeFileSync(join(projectDir, 'main.js'), 'console.log("Hello world");');
      writeFileSync(join(projectDir, 'package.json'), '{"name": "test"}');
      
      // 3. Bulk add todos from project
      const bulkResponse = await executeMcpTool({
        name: 'bulk-add-todos',
        arguments: { folderPath: projectDir }
      });
      expect(bulkResponse.isError).toBeFalsy();
      
      // 4. Get first task
      const firstTaskResponse = await executeMcpTool({
        name: 'get-next-todo',
        arguments: {}
      });
      expect(firstTaskResponse.isError).toBeFalsy();
      
      // 5. Update task with additional context
      const todoData = JSON.parse(firstTaskResponse.content[0].text.replace('Next todo: ', ''));
      const updateResponse = await executeMcpTool({
        name: 'update-todo',
        arguments: {
          id: todoData.id,
          description: todoData.description + '\n\n**Status:** In progress'
        }
      });
      expect(updateResponse.isError).toBeFalsy();
      
      // 6. Complete the task
      const completeResponse = await executeMcpTool({
        name: 'complete-todo',
        arguments: { id: todoData.id }
      });
      expect(completeResponse.isError).toBeFalsy();
      
      // 7. Get next task
      const nextTaskResponse = await executeMcpTool({
        name: 'get-next-todo',
        arguments: {}
      });
      expect(nextTaskResponse.isError).toBeFalsy();
      expect(nextTaskResponse.content[0].text).not.toContain(todoData.title);
    });
  });
});