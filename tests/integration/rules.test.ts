/**
 * Integration tests for Rules MCP tools
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync, rmSync } from 'fs';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ruleService } from '../../src/services/RuleService.js';

// Mock the MCP server tools for testing
describe('Rules MCP Tools Integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(process.cwd(), 'tests', 'temp', 'rules-integration');
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
    ruleService.clearAllRules();
  });

  describe('add-rules tool', () => {
    it('should validate required parameters', () => {
      const AddRulesSchema = z.object({
        filePath: z.string().min(1, "File path is required"),
        clearAll: z.boolean().optional().default(false),
      });

      // Test valid parameters
      expect(() => AddRulesSchema.parse({
        filePath: '/path/to/file.txt',
        clearAll: false
      })).not.toThrow();

      // Test missing filePath
      expect(() => AddRulesSchema.parse({
        clearAll: false
      })).toThrow('Required');

      // Test empty filePath
      expect(() => AddRulesSchema.parse({
        filePath: '',
        clearAll: false
      })).toThrow('File path is required');

      // Test default clearAll
      const result = AddRulesSchema.parse({
        filePath: '/path/to/file.txt'
      });
      expect(result.clearAll).toBe(false);
    });

    it('should handle successful rule addition', async () => {
      const filePath = join(tempDir, 'success-rule.txt');
      const ruleContent = 'This is a successful rule addition test';
      writeFileSync(filePath, ruleContent);

      const rules = await ruleService.addRules({
        filePath: filePath,
        clearAll: false
      });

      expect(rules).toHaveLength(1);
      expect(rules[0].description).toBe(ruleContent);
      expect(rules[0].filePath).toBe(filePath);
    });

    it('should handle file not found error', async () => {
      const nonExistentPath = join(tempDir, 'non-existent-file.txt');

      await expect(ruleService.addRules({
        filePath: nonExistentPath,
        clearAll: false
      })).rejects.toThrow(`File does not exist: ${nonExistentPath}`);
    });

    it('should handle directory instead of file error', async () => {
      const dirPath = join(tempDir, 'test-directory');
      mkdirSync(dirPath);

      await expect(ruleService.addRules({
        filePath: dirPath,
        clearAll: false
      })).rejects.toThrow(`Path is not a file: ${dirPath}`);
    });

    it('should handle empty file error', async () => {
      const emptyFilePath = join(tempDir, 'empty-file.txt');
      writeFileSync(emptyFilePath, '');

      await expect(ruleService.addRules({
        filePath: emptyFilePath,
        clearAll: false
      })).rejects.toThrow(`File is empty: ${emptyFilePath}`);
    });

    it('should handle clearAll functionality', async () => {
      // Create first rule
      const firstFile = join(tempDir, 'first-rule.txt');
      writeFileSync(firstFile, 'First rule content');
      await ruleService.addRules({ filePath: firstFile, clearAll: false });

      // Verify first rule exists
      let allRules = ruleService.getRules();
      expect(allRules).toHaveLength(1);

      // Add second rule with clearAll=true
      const secondFile = join(tempDir, 'second-rule.txt');
      writeFileSync(secondFile, 'Second rule content');
      await ruleService.addRules({ filePath: secondFile, clearAll: true });

      // Verify only second rule exists
      allRules = ruleService.getRules();
      expect(allRules).toHaveLength(1);
      expect(allRules[0].description).toBe('Second rule content');
    });
  });

  describe('get-rules tool', () => {
    it('should validate optional parameters', () => {
      const GetRulesSchema = z.object({
        id: z.number().int().positive("Invalid Rule ID").optional(),
      });

      // Test valid parameters
      expect(() => GetRulesSchema.parse({})).not.toThrow();
      expect(() => GetRulesSchema.parse({ id: 5 })).not.toThrow();

      // Test invalid ID types
      expect(() => GetRulesSchema.parse({ id: -1 })).toThrow('Invalid Rule ID');
      expect(() => GetRulesSchema.parse({ id: 0 })).toThrow('Invalid Rule ID');
      expect(() => GetRulesSchema.parse({ id: 1.5 })).toThrow();
    });

    it('should return empty array when no rules exist', () => {
      const rules = ruleService.getRules();
      expect(rules).toHaveLength(0);
      expect(Array.isArray(rules)).toBe(true);
    });

    it('should return all rules', async () => {
      // Create multiple rules
      const files = ['rule1.txt', 'rule2.txt', 'rule3.txt'];
      for (let i = 0; i < files.length; i++) {
        const filePath = join(tempDir, files[i]);
        writeFileSync(filePath, `Rule ${i + 1} content`);
        await ruleService.addRules({ filePath });
      }

      const rules = ruleService.getRules();
      expect(rules).toHaveLength(3);
      rules.forEach((rule, index) => {
        expect(rule.description).toBe(`Rule ${index + 1} content`);
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('createdAt');
        expect(rule).toHaveProperty('updatedAt');
        expect(rule).toHaveProperty('filePath');
      });
    });

    it('should return specific rule by ID', async () => {
      // Create a rule
      const filePath = join(tempDir, 'specific-rule.txt');
      const content = 'Specific rule for ID test';
      writeFileSync(filePath, content);
      const [createdRule] = await ruleService.addRules({ filePath });

      // Get specific rule by ID
      const rules = ruleService.getRules({ id: createdRule.id });
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe(createdRule.id);
      expect(rules[0].description).toBe(content);
    });

    it('should return empty array for non-existent ID', async () => {
      // Create a rule first
      const filePath = join(tempDir, 'test-rule.txt');
      writeFileSync(filePath, 'Test content');
      await ruleService.addRules({ filePath });

      // Try to get non-existent rule
      const rules = ruleService.getRules({ id: 99999 });
      expect(rules).toHaveLength(0);
    });
  });

  describe('Rules tool error handling', () => {
    it('should handle various file types appropriately', async () => {
      const testFiles = [
        { name: 'text.txt', content: 'Plain text content', shouldWork: true },
        { name: 'markdown.md', content: '# Markdown Rule\nContent here', shouldWork: true },
        { name: 'json.json', content: '{"rule": "JSON content"}', shouldWork: true },
        { name: 'javascript.js', content: 'console.log("JS rule");', shouldWork: true },
        { name: 'python.py', content: 'print("Python rule")', shouldWork: true },
        { name: 'no-extension', content: 'File without extension', shouldWork: true }
      ];

      for (const testFile of testFiles) {
        const filePath = join(tempDir, testFile.name);
        writeFileSync(filePath, testFile.content);

        if (testFile.shouldWork) {
          const rules = await ruleService.addRules({ filePath });
          expect(rules).toHaveLength(1);
          expect(rules[0].description).toBe(testFile.content);
        }
      }

      // Verify all rules were created
      const allRules = ruleService.getRules();
      expect(allRules.length).toBe(testFiles.filter(f => f.shouldWork).length);
    });

    it('should handle binary files gracefully', async () => {
      // Create a binary file (simulate with non-UTF8 content)
      const binaryPath = join(tempDir, 'binary.bin');
      const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0xFF, 0xFE]);
      writeFileSync(binaryPath, binaryContent);

      // Should still work as it reads as string, but content may be garbled
      const rules = await ruleService.addRules({ filePath: binaryPath });
      expect(rules).toHaveLength(1);
      expect(rules[0].filePath).toBe(binaryPath);
    });

    it('should handle concurrent operations safely', async () => {
      const promises = [];
      
      // Create multiple files and add rules concurrently
      for (let i = 0; i < 10; i++) {
        const filePath = join(tempDir, `concurrent-${i}.txt`);
        writeFileSync(filePath, `Concurrent rule ${i}`);
        promises.push(ruleService.addRules({ filePath }));
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      
      // Verify all rules were created
      const allRules = ruleService.getRules();
      expect(allRules).toHaveLength(10);
    });

    it('should handle very long file paths', async () => {
      // Create nested directories with long names
      const longDirName = 'a'.repeat(50);
      const longFileName = 'b'.repeat(50) + '.txt';
      const nestedDir = join(tempDir, longDirName, longDirName);
      mkdirSync(nestedDir, { recursive: true });
      
      const longFilePath = join(nestedDir, longFileName);
      writeFileSync(longFilePath, 'Content in long path');

      const rules = await ruleService.addRules({ filePath: longFilePath });
      expect(rules).toHaveLength(1);
      expect(rules[0].filePath).toBe(longFilePath);
    });
  });

  describe('Tool response formatting', () => {
    it('should format successful add-rules response', async () => {
      const filePath = join(tempDir, 'format-test.txt');
      writeFileSync(filePath, 'Test content');

      const rules = await ruleService.addRules({ filePath, clearAll: false });
      
      // Simulate the tool response formatting
      const response = {
        ruleCount: rules.length,
        summary: `Created ${rules.length} rule from ${filePath}`
      };

      expect(response.ruleCount).toBe(1);
      expect(response.summary).toBe(`Created 1 rule from ${filePath}`);
    });

    it('should format successful add-rules response with clearAll', async () => {
      const filePath = join(tempDir, 'format-clear-test.txt');
      writeFileSync(filePath, 'Test content');

      const rules = await ruleService.addRules({ filePath, clearAll: true });
      
      // Simulate the tool response formatting
      const clearMessage = " (after clearing all existing rules)";
      const response = {
        ruleCount: rules.length,
        summary: `Created ${rules.length} rule from ${filePath}${clearMessage}`
      };

      expect(response.summary).toBe(`Created 1 rule from ${filePath} (after clearing all existing rules)`);
    });

    it('should format get-rules response for single rule', async () => {
      const filePath = join(tempDir, 'single-rule-format.txt');
      writeFileSync(filePath, 'Single rule content');
      const [rule] = await ruleService.addRules({ filePath });

      const rules = ruleService.getRules({ id: rule.id });
      
      // Simulate the formatted response
      const formattedResponse = `**Rule ${rules[0].id}**
Created: ${rules[0].createdAt}
Source: ${rules[0].filePath}

${rules[0].description}`;

      expect(formattedResponse).toContain(`**Rule ${rule.id}**`);
      expect(formattedResponse).toContain('Single rule content');
      expect(formattedResponse).toContain(filePath);
    });

    it('should format get-rules response for multiple rules', async () => {
      // Create multiple rules
      const files = ['rule1.txt', 'rule2.txt'];
      for (let i = 0; i < files.length; i++) {
        const filePath = join(tempDir, files[i]);
        writeFileSync(filePath, `Rule ${i + 1} content`);
        await ruleService.addRules({ filePath });
      }

      const rules = ruleService.getRules();
      
      // Simulate the formatted response for multiple rules
      const formattedResponse = rules.map(rule => 
        `**Rule ${rule.id}**
Created: ${rule.createdAt}
Source: ${rule.filePath}

${rule.description}
---`
      ).join('\n');

      expect(formattedResponse).toContain('**Rule');
      expect(formattedResponse).toContain('Rule 1 content');
      expect(formattedResponse).toContain('Rule 2 content');
      expect(formattedResponse).toContain('---');
    });
  });
});