/**
 * RuleService.ts - Rule management service
 *
 * Core business logic for managing rules.
 * Includes: Add rules from file, get rules, and clear all rules.
 */
import {
  Rule,
  createRule,
  AddRulesSchema,
  GetRulesSchema,
} from '../models/Rule.js'
import { z } from 'zod'
import { databaseService } from './DatabaseService.js'
import * as fs from 'fs'
import * as path from 'path'

/**
 * RuleService Class
 */
class RuleService {
  /**
   * Add rules from a file
   */
  async addRules(data: { filePath: string; clearAll?: boolean }): Promise<Rule[]> {
    const { filePath, clearAll } = data

    // Clear all existing rules if requested
    if (clearAll) {
      const deletedCount = this.clearAllRules()
      console.log(`Cleared ${deletedCount} existing rules before adding new ones`)
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`)
    }

    if (!fs.statSync(filePath).isFile()) {
      throw new Error(`Path is not a file: ${filePath}`)
    }

    // Read file content
    let fileContent: string
    try {
      fileContent = await fs.promises.readFile(filePath, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    const trimmedContent = fileContent.trim()
    if (!trimmedContent) {
      throw new Error(`File is empty: ${filePath}`)
    }

    // Create rule with file content as description
    const ruleData = createRule(trimmedContent, filePath)

    const db = databaseService.getDb()
    const stmt = db.prepare(`
      INSERT INTO rules (description, createdAt, updatedAt, filePath)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(
      ruleData.description,
      ruleData.createdAt,
      ruleData.updatedAt,
      ruleData.filePath,
    )

    const ruleId = result.lastInsertRowid as number

    // Return the created rule with the auto-generated ID
    const createdRule: Rule = {
      id: ruleId,
      ...ruleData,
    }

    return [createdRule]
  }

  /**
   * Get all rules or a specific rule by ID
   */
  getRules(data?: { id?: number }): Rule[] {
    const db = databaseService.getDb()
    
    if (data?.id) {
      // Get specific rule by ID
      const stmt = db.prepare('SELECT * FROM rules WHERE id = ?')
      const row = stmt.get(data.id) as any
      
      if (!row) return []
      
      return [this.rowToRule(row)]
    } else {
      // Get all rules
      const stmt = db.prepare('SELECT * FROM rules ORDER BY createdAt ASC')
      const rows = stmt.all() as any[]
      
      return rows.map(row => this.rowToRule(row))
    }
  }

  /**
   * Clear all rules from the database
   */
  clearAllRules(): number {
    const db = databaseService.getDb()
    const stmt = db.prepare('DELETE FROM rules')
    const result = stmt.run()

    return result.changes
  }

  /**
   * Helper to convert a database row to a Rule object
   */
  private rowToRule(row: any): Rule {
    return {
      id: row.id,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      filePath: row.filePath,
    }
  }
}

// Create a singleton instance
export const ruleService = new RuleService()