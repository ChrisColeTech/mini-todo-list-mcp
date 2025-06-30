/**
 * Unit tests for RuleService
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync, rmSync } from 'fs';
import { ruleService } from '../../src/services/RuleService.js';

describe('RuleService', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(process.cwd(), 'tests', 'temp', 'rule-tests');
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
    ruleService.clearAllRules();
  });

  describe('addRules - Happy Path', () => {
    it('should add rule from file content', async () => {
      const filePath = join(tempDir, 'test-rule.txt');
      const ruleContent = 'This is a test rule content';
      writeFileSync(filePath, ruleContent);
      
      const rules = await ruleService.addRules({
        filePath: filePath,
        clearAll: false
      });
      
      expect(rules).toHaveLength(1);
      expect(rules[0]).toHaveProperty('id');
      expect(rules[0].description).toBe(ruleContent);
      expect(rules[0].filePath).toBe(filePath);
      expect(rules[0]).toHaveProperty('createdAt');
      expect(rules[0]).toHaveProperty('updatedAt');
    });

    it('should add rule with clearAll=true', async () => {
      // First create an existing rule
      const firstFilePath = join(tempDir, 'first-rule.txt');
      writeFileSync(firstFilePath, 'First rule');
      await ruleService.addRules({ filePath: firstFilePath, clearAll: false });
      
      // Verify rule was created
      let allRules = ruleService.getRules();
      expect(allRules).toHaveLength(1);
      
      // Add second rule with clearAll=true
      const secondFilePath = join(tempDir, 'second-rule.txt');
      writeFileSync(secondFilePath, 'Second rule');
      const newRules = await ruleService.addRules({ filePath: secondFilePath, clearAll: true });
      
      expect(newRules).toHaveLength(1);
      expect(newRules[0].description).toBe('Second rule');
      
      // Verify only the new rule exists
      allRules = ruleService.getRules();
      expect(allRules).toHaveLength(1);
      expect(allRules[0].description).toBe('Second rule');
    });

    it('should handle multiline content', async () => {
      const filePath = join(tempDir, 'multiline-rule.txt');
      const multilineContent = `Line 1
Line 2
Line 3`;
      writeFileSync(filePath, multilineContent);
      
      const rules = await ruleService.addRules({ filePath });
      
      expect(rules[0].description).toBe(multilineContent);
    });
  });

  describe('addRules - Unhappy Path', () => {
    it('should throw error for non-existent file', async () => {
      const nonExistentPath = join(tempDir, 'non-existent.txt');
      
      await expect(ruleService.addRules({ filePath: nonExistentPath }))
        .rejects.toThrow(`File does not exist: ${nonExistentPath}`);
    });

    it('should throw error when path is a directory', async () => {
      const dirPath = join(tempDir, 'test-dir');
      mkdirSync(dirPath);
      
      await expect(ruleService.addRules({ filePath: dirPath }))
        .rejects.toThrow(`Path is not a file: ${dirPath}`);
    });

    it('should throw error for empty file', async () => {
      const emptyFilePath = join(tempDir, 'empty.txt');
      writeFileSync(emptyFilePath, '');
      
      await expect(ruleService.addRules({ filePath: emptyFilePath }))
        .rejects.toThrow(`File is empty: ${emptyFilePath}`);
    });

    it('should throw error for whitespace-only file', async () => {
      const whitespaceFilePath = join(tempDir, 'whitespace.txt');
      writeFileSync(whitespaceFilePath, '   \n\t   \n   ');
      
      await expect(ruleService.addRules({ filePath: whitespaceFilePath }))
        .rejects.toThrow(`File is empty: ${whitespaceFilePath}`);
    });

    it('should handle file read errors gracefully', async () => {
      const filePath = join(tempDir, 'permission-test.txt');
      writeFileSync(filePath, 'test content');
      
      // Simulate read error by removing the file after creation
      rmSync(filePath);
      
      await expect(ruleService.addRules({ filePath }))
        .rejects.toThrow(`File does not exist: ${filePath}`);
    });
  });

  describe('getRules - Happy Path', () => {
    it('should return empty array when no rules exist', () => {
      const rules = ruleService.getRules();
      expect(rules).toHaveLength(0);
      expect(Array.isArray(rules)).toBe(true);
    });

    it('should return all rules', async () => {
      // Create multiple rules
      const file1 = join(tempDir, 'rule1.txt');
      const file2 = join(tempDir, 'rule2.txt');
      writeFileSync(file1, 'Rule 1 content');
      writeFileSync(file2, 'Rule 2 content');
      
      await ruleService.addRules({ filePath: file1 });
      await ruleService.addRules({ filePath: file2 });
      
      const rules = ruleService.getRules();
      expect(rules).toHaveLength(2);
      expect(rules[0].description).toBe('Rule 1 content');
      expect(rules[1].description).toBe('Rule 2 content');
    });

    it('should return specific rule by ID', async () => {
      const filePath = join(tempDir, 'specific-rule.txt');
      writeFileSync(filePath, 'Specific rule content');
      
      const [createdRule] = await ruleService.addRules({ filePath });
      
      const rules = ruleService.getRules({ id: createdRule.id });
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe(createdRule.id);
      expect(rules[0].description).toBe('Specific rule content');
    });

    it('should return rules in creation order', async () => {
      const files = ['rule1.txt', 'rule2.txt', 'rule3.txt'];
      for (let i = 0; i < files.length; i++) {
        const filePath = join(tempDir, files[i]);
        writeFileSync(filePath, `Rule ${i + 1} content`);
        await ruleService.addRules({ filePath });
      }
      
      const rules = ruleService.getRules();
      expect(rules).toHaveLength(3);
      for (let i = 0; i < 3; i++) {
        expect(rules[i].description).toBe(`Rule ${i + 1} content`);
      }
    });
  });

  describe('getRules - Unhappy Path', () => {
    it('should return empty array for non-existent ID', async () => {
      const filePath = join(tempDir, 'test-rule.txt');
      writeFileSync(filePath, 'Test rule');
      await ruleService.addRules({ filePath });
      
      const rules = ruleService.getRules({ id: 99999 });
      expect(rules).toHaveLength(0);
    });

    it('should handle invalid ID gracefully', () => {
      const rules = ruleService.getRules({ id: -1 });
      expect(rules).toHaveLength(0);
    });
  });

  describe('clearAllRules', () => {
    it('should clear all rules and return count', async () => {
      // Create some rules first
      const file1 = join(tempDir, 'rule1.txt');
      const file2 = join(tempDir, 'rule2.txt');
      writeFileSync(file1, 'Rule 1');
      writeFileSync(file2, 'Rule 2');
      
      await ruleService.addRules({ filePath: file1 });
      await ruleService.addRules({ filePath: file2 });
      
      // Verify rules exist
      let rules = ruleService.getRules();
      expect(rules).toHaveLength(2);
      
      // Clear all rules
      const clearedCount = ruleService.clearAllRules();
      expect(clearedCount).toBe(2);
      
      // Verify no rules remain
      rules = ruleService.getRules();
      expect(rules).toHaveLength(0);
    });

    it('should return 0 when no rules to clear', () => {
      const clearedCount = ruleService.clearAllRules();
      expect(clearedCount).toBe(0);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle special characters in file content', async () => {
      const filePath = join(tempDir, 'special-chars.txt');
      const specialContent = 'Rule with éspecial çharacters and 中文 and 🚀 emoji';
      writeFileSync(filePath, specialContent);
      
      const rules = await ruleService.addRules({ filePath });
      expect(rules[0].description).toBe(specialContent);
    });

    it('should handle very long file content', async () => {
      const filePath = join(tempDir, 'long-content.txt');
      const longContent = 'A'.repeat(10000); // 10KB of content
      writeFileSync(filePath, longContent);
      
      const rules = await ruleService.addRules({ filePath });
      expect(rules[0].description).toBe(longContent);
      expect(rules[0].description.length).toBe(10000);
    });

    it('should handle file paths with special characters', async () => {
      const specialDir = join(tempDir, 'special-dir with spaces');
      mkdirSync(specialDir, { recursive: true });
      const filePath = join(specialDir, 'file with spaces.txt');
      writeFileSync(filePath, 'Content in special path');
      
      const rules = await ruleService.addRules({ filePath });
      expect(rules[0].description).toBe('Content in special path');
      expect(rules[0].filePath).toBe(filePath);
    });

    it('should trim whitespace from file content', async () => {
      const filePath = join(tempDir, 'whitespace-trim.txt');
      writeFileSync(filePath, '  \n  Rule content with surrounding whitespace  \n  ');
      
      const rules = await ruleService.addRules({ filePath });
      expect(rules[0].description).toBe('Rule content with surrounding whitespace');
    });

    it('should handle concurrent rule additions', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const filePath = join(tempDir, `concurrent-rule-${i}.txt`);
        writeFileSync(filePath, `Concurrent rule ${i}`);
        promises.push(ruleService.addRules({ filePath }));
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
      
      const allRules = ruleService.getRules();
      expect(allRules).toHaveLength(5);
    });
  });

  describe('Database Integration', () => {
    it('should persist rules across service calls', async () => {
      const filePath = join(tempDir, 'persistent-rule.txt');
      writeFileSync(filePath, 'Persistent rule content');
      
      await ruleService.addRules({ filePath });
      
      // Get rules using a fresh call
      const rules = ruleService.getRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].description).toBe('Persistent rule content');
    });

    it('should maintain rule order with timestamps', async () => {
      const file1 = join(tempDir, 'first.txt');
      const file2 = join(tempDir, 'second.txt');
      
      writeFileSync(file1, 'First rule');
      await ruleService.addRules({ filePath: file1 });
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      writeFileSync(file2, 'Second rule');
      await ruleService.addRules({ filePath: file2 });
      
      const rules = ruleService.getRules();
      expect(rules).toHaveLength(2);
      expect(new Date(rules[0].createdAt).getTime())
        .toBeLessThan(new Date(rules[1].createdAt).getTime());
    });
  });
});