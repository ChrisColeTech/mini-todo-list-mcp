/**
 * TodoService.ts - Mini Version
 *
 * Core business logic for managing todos with only essential methods.
 * Includes: CRUD operations, bulk add, bulk clear, and get next todo.
 */
import {
  Todo,
  createTodo,
  CreateTodoSchema,
  UpdateTodoSchema,
  BulkAddTodosSchema,
} from '../models/Todo.js'
import { z } from 'zod'
import { databaseService } from './DatabaseService.js'
import * as fs from 'fs'
import * as path from 'path'

/**
 * TodoService Class - Mini Version
 * Only includes essential methods for the mini MCP server
 */
class TodoService {
  /**
   * Create a new todo
   */
  createTodo(data: z.infer<typeof CreateTodoSchema>, passedFilePath?: string, taskNumber?: number): Todo {
    const db = databaseService.getDb()

    // Determine the final file path and read content if needed
    const finalFilePath = data.filePath || passedFilePath
    let finalTitle = data.title
    let finalDescription = data.description

    // If filePath is provided, read file content and create structured description
    if (data.filePath) {
      if (!fs.existsSync(data.filePath)) {
        throw new Error(`File does not exist: ${data.filePath}`)
      }

      try {
        const fileContent = fs.readFileSync(data.filePath, 'utf-8').trim()
        if (!fileContent) {
          throw new Error(`File is empty: ${data.filePath}`)
        }

        // Auto-generate title from filename if not provided meaningfully
        if (data.title === data.filePath || data.title.trim() === '') {
          const fileName = path.basename(data.filePath, path.extname(data.filePath))
          finalTitle = fileName
        }

        // Override description with file content and metadata
        finalDescription = `**Source File:** ${data.filePath}

${fileContent}

**When completed, use the complete-todo MCP tool with ID: [ID will be auto-filled]**`
      } catch (error) {
        throw new Error(`Failed to read file ${data.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Check for duplicate title and description combination
    const duplicateCheckStmt = db.prepare(
      'SELECT id FROM todos WHERE title = ? AND description = ?',
    )
    const existingTodo = duplicateCheckStmt.get(finalTitle, finalDescription) as any

    if (existingTodo) {
      throw new Error(
        `A todo with the same title and description already exists (ID: ${existingTodo.id})`,
      )
    }

    // If no task number provided, get the next available one
    let finalTaskNumber = taskNumber
    if (finalTaskNumber === undefined) {
      const maxTaskNumberStmt = db.prepare('SELECT MAX(taskNumber) as maxTaskNumber FROM todos')
      const maxResult = maxTaskNumberStmt.get() as any
      finalTaskNumber = (maxResult?.maxTaskNumber || 0) + 1
    }

    const todoData = createTodo({ title: finalTitle, description: finalDescription }, finalFilePath, finalTaskNumber)

    const stmt = db.prepare(`
      INSERT INTO todos (title, description, completedAt, createdAt, updatedAt, filePath, status, taskNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      todoData.title,
      todoData.description,
      todoData.completedAt,
      todoData.createdAt,
      todoData.updatedAt,
      todoData.filePath,
      todoData.status,
      todoData.taskNumber,
    )

    const todoId = result.lastInsertRowid as number

    // If we read from a file, update the description with the actual ID
    if (data.filePath) {
      const updatedDescription = finalDescription.replace(
        '**When completed, use the complete-todo MCP tool with ID: [ID will be auto-filled]**',
        `**When completed, use the complete-todo MCP tool:**
- ID: ${todoId}`
      )

      const updateStmt = db.prepare('UPDATE todos SET description = ? WHERE id = ?')
      updateStmt.run(updatedDescription, todoId)

      return {
        id: todoId,
        ...todoData,
        description: updatedDescription,
      }
    }

    // Return the created todo with the auto-generated ID
    return {
      id: todoId,
      ...todoData,
    }
  }

  /**
   * Get a todo by ID
   */
  getTodo(id: number): Todo | undefined {
    const db = databaseService.getDb()
    const stmt = db.prepare('SELECT * FROM todos WHERE id = ?')
    const row = stmt.get(id) as any

    if (!row) return undefined

    return this.rowToTodo(row)
  }

  /**
   * Update a todo
   */
  updateTodo(data: z.infer<typeof UpdateTodoSchema>): Todo | undefined {
    const todo = this.getTodo(data.id)
    if (!todo) return undefined

    const updatedAt = new Date().toISOString()

    const db = databaseService.getDb()
    const stmt = db.prepare(`
      UPDATE todos
      SET title = ?, description = ?, updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(data.title || todo.title, data.description || todo.description, updatedAt, todo.id)

    return this.getTodo(todo.id)
  }

  /**
   * Mark a todo as completed
   */
  completeTodo(id: number): Todo | undefined {
    const todo = this.getTodo(id)
    if (!todo) return undefined

    const now = new Date().toISOString()

    const db = databaseService.getDb()
    const stmt = db.prepare(`
      UPDATE todos
      SET completedAt = ?, updatedAt = ?, status = 'Done'
      WHERE id = ?
    `)

    stmt.run(now, now, id)

    return this.getTodo(id)
  }

  /**
   * Delete a todo
   */
  deleteTodo(id: number): boolean {
    const db = databaseService.getDb()
    const stmt = db.prepare('DELETE FROM todos WHERE id = ?')
    const result = stmt.run(id)

    return result.changes > 0
  }

  /**
   * Get next todo that is not marked as 'Done'
   */
  getNextTodo(): Todo | undefined {
    const db = databaseService.getDb()
    const stmt = db.prepare(`
      SELECT * FROM todos 
      WHERE status != 'Done' 
      ORDER BY taskNumber ASC
      LIMIT 1
    `)
    const row = stmt.get() as any

    if (!row) return undefined

    return this.rowToTodo(row)
  }

  /**
   * Get next todo number only
   */
  getNextTodoNumber(): number | null {
    const db = databaseService.getDb()
    const stmt = db.prepare(`
      SELECT taskNumber FROM todos 
      WHERE status != 'Done' 
      ORDER BY taskNumber ASC
      LIMIT 1
    `)
    const row = stmt.get() as any

    return row ? row.taskNumber : null
  }

  /**
   * Get next todo ID and task number
   */
  getNextTodoId(): { id: number; taskNumber: number } | null {
    const db = databaseService.getDb()
    const stmt = db.prepare(`
      SELECT id, taskNumber FROM todos 
      WHERE status != 'Done' 
      ORDER BY taskNumber ASC
      LIMIT 1
    `)
    const row = stmt.get() as any

    return row ? { id: row.id, taskNumber: row.taskNumber } : null
  }

  /**
   * Bulk add todos by reading file contents directly (optimized with parallel processing)
   */
  async bulkAddTodos(data: z.infer<typeof BulkAddTodosSchema>): Promise<Todo[]> {
    const { folderPath, clearAll } = data

    // Clear all existing todos if requested
    if (clearAll) {
      const deletedCount = this.clearAllTodos()
      console.log(`Cleared ${deletedCount} existing todos before bulk add`)
    }

    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Folder does not exist: ${folderPath}`)
    }

    if (!fs.statSync(folderPath).isDirectory()) {
      throw new Error(`Path is not a directory: ${folderPath}`)
    }

    // Get all files recursively
    const allFilePaths = this.getAllFilesRecursively(folderPath)

    if (allFilePaths.length === 0) {
      throw new Error(`No files found in directory: ${folderPath}`)
    }

    // Get database connection for validation
    const db = databaseService.getDb()

    // Filter out duplicate file paths
    const validationResults = this.validateFilePaths(allFilePaths, db)
    const filePaths = validationResults.validFiles

    if (filePaths.length === 0) {
      throw new Error(
        `No valid files to process. ${validationResults.duplicates.length} files already have tasks.`,
      )
    }

    // Log validation summary if there were duplicates
    if (validationResults.duplicates.length > 0) {
      console.warn(
        `Validation summary: Processing ${filePaths.length} files, skipped ${validationResults.duplicates.length} duplicates`,
      )
    }

    // Get the highest existing task number
    const maxTaskNumberStmt = db.prepare('SELECT MAX(taskNumber) as maxTaskNumber FROM todos')
    const maxResult = maxTaskNumberStmt.get() as any
    const startingTaskNumber = (maxResult?.maxTaskNumber || 0) + 1

    // Read all files in parallel
    const fileReadPromises = filePaths.map(async (filePath, index) => {
      try {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8')
        const trimmedContent = fileContent.trim()

        if (!trimmedContent) {
          return { filePath, content: null, error: 'Empty file' }
        }

        return {
          filePath,
          content: trimmedContent,
          taskNumber: startingTaskNumber + index,
          error: null,
        }
      } catch (error) {
        return {
          filePath,
          content: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })

    console.log(`Reading ${filePaths.length} files in parallel...`)
    const fileResults = await Promise.all(fileReadPromises)

    // Filter successful reads and track skipped files
    const validFileResults = fileResults.filter((result) => result.content !== null)
    const skippedFiles = fileResults.filter((result) => result.content === null)

    // Log skipped files
    skippedFiles.forEach((result) => {
      console.warn(`Skipping file (${result.error}): ${result.filePath}`)
    })

    if (validFileResults.length === 0) {
      throw new Error('No valid files to process after filtering.')
    }

    console.log(`Processing ${validFileResults.length} valid files...`)

    // Prepare all todos in memory first
    const todosToCreate = validFileResults.map((result) => {
      const fileName = path.basename(result.filePath, path.extname(result.filePath))
      const title = `Task ${result.taskNumber}: ${fileName}`

      const description = `**Task ${result.taskNumber}**

${result.content}

**When completed, use the complete-todo MCP tool with ID: [ID will be auto-filled]**`

      const todoData = { title, description }
      const todoWithoutId = createTodo(todoData, result.filePath, result.taskNumber)

      return { todoWithoutId, originalDescription: description }
    })

    // Batch insert all todos in a single transaction
    console.log(`Inserting ${todosToCreate.length} todos in batch...`)
    const insertStmt = db.prepare(`
      INSERT INTO todos (title, description, completedAt, createdAt, updatedAt, filePath, status, taskNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const updateStmt = db.prepare('UPDATE todos SET description = ? WHERE id = ?')

    const finalTodos: Todo[] = []

    const transaction = db.transaction(
      (todoData: Array<{ todoWithoutId: Omit<Todo, 'id'>; originalDescription: string }>) => {
        for (const { todoWithoutId, originalDescription } of todoData) {
          const result = insertStmt.run(
            todoWithoutId.title,
            todoWithoutId.description,
            todoWithoutId.completedAt,
            todoWithoutId.createdAt,
            todoWithoutId.updatedAt,
            todoWithoutId.filePath,
            todoWithoutId.status,
            todoWithoutId.taskNumber,
          )

          const todoId = result.lastInsertRowid as number

          // Update description with actual ID
          const finalDescription = originalDescription.replace(
            '**When completed, use the complete-todo MCP tool with ID: [ID will be auto-filled]**',
            `**When completed, use the complete-todo MCP tool:**
- ID: ${todoId}`,
          )

          updateStmt.run(finalDescription, todoId)

          finalTodos.push({
            id: todoId,
            ...todoWithoutId,
            description: finalDescription,
          })
        }
      },
    )

    transaction(todosToCreate)

    // Log processing summary
    console.log(
      `Processing complete: Created ${finalTodos.length} todos, skipped ${skippedFiles.length} files`,
    )
    if (skippedFiles.length > 0) {
      console.warn(`Skipped files: ${skippedFiles.length} (binary/empty/unreadable)`)
    }

    return finalTodos
  }

  /**
   * Clear all todos from the database
   */
  clearAllTodos(): number {
    const db = databaseService.getDb()
    const stmt = db.prepare('DELETE FROM todos')
    const result = stmt.run()

    return result.changes
  }

  /**
   * Helper to convert a database row to a Todo object
   */
  private rowToTodo(row: any): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      completedAt: row.completedAt,
      completed: row.completedAt !== null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      filePath: row.filePath,
      status: row.status || 'New',
      taskNumber: row.taskNumber,
    }
  }

  /**
   * Validate file paths for duplicate detection
   */
  private validateFilePaths(
    filePaths: string[],
    db: any,
  ): {
    validFiles: string[]
    duplicates: string[]
  } {
    const validFiles: string[] = []
    const duplicates: string[] = []

    const existingFilePathsStmt = db.prepare(
      'SELECT filePath FROM todos WHERE filePath IS NOT NULL',
    )
    const existingRows = existingFilePathsStmt.all() as any[]
    const existingFilePaths = new Set(existingRows.map((row) => row.filePath))

    for (const filePath of filePaths) {
      if (existingFilePaths.has(filePath)) {
        duplicates.push(filePath)
        continue
      }

      validFiles.push(filePath)
    }

    return { validFiles, duplicates }
  }

  /**
   * Recursively get all files in a directory
   */
  private getAllFilesRecursively(dirPath: string): string[] {
    const files: string[] = []

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        if (entry.isDirectory()) {
          files.push(...this.getAllFilesRecursively(fullPath))
        } else if (entry.isFile()) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to read directory ${dirPath}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    }

    // Sort files using natural/alphanumeric sorting to handle numbers correctly
    // This ensures task_01.2 comes before task_01.12
    return files.sort((a, b) => this.naturalSort(a, b))
  }

  /**
   * Natural/alphanumeric sorting function that handles numbers correctly
   * Ensures task_01.2 comes before task_01.12
   */
  private naturalSort(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  }
}

// Create a singleton instance
export const todoService = new TodoService()
