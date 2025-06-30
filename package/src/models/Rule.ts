/**
 * Rule.ts - Rule model and validation schemas
 * 
 * Core rule model and validation schemas for rules management.
 * Uses integer IDs for simplicity.
 */
import { z } from 'zod';

/**
 * Core Rule interface - using integer IDs for simplicity
 */
export interface Rule {
  id: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  filePath?: string;
}

/**
 * Validation schemas for Rule operations
 */

// Add Rules Operation
export const AddRulesSchema = z.object({
  filePath: z.string().min(1, "File path is required"),
  clearAll: z.boolean().optional().default(false),
});

export const GetRulesSchema = z.object({
  id: z.number().int().positive("Invalid Rule ID").optional(),
});

/**
 * Factory function to create a new Rule with proper defaults
 * Note: ID will be set by the database auto-increment
 */
export function createRule(
  description: string, 
  filePath?: string
): Omit<Rule, 'id'> {
  const now = new Date().toISOString();
  
  return {
    description,
    createdAt: now,
    updatedAt: now,
    filePath,
  };
}