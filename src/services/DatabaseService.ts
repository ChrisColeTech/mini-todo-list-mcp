/**
 * DatabaseService.ts - Mini Version
 * 
 * Lightweight SQLite database service for the mini todo application.
 */
import Database from 'better-sqlite3';
import { config, ensureDbFolder } from '../config.js';

/**
 * DatabaseService Class - same as full version but with mini branding
 */
class DatabaseService {
  private db: Database.Database;

  constructor() {
    ensureDbFolder();
    this.db = new Database(config.db.path);
    
    // Set pragmas for performance and safety
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    this.initSchema();
  }

  /**
   * Initialize the database schema - same as full version
   */
  private initSchema(): void {
    // Create todos table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completedAt TEXT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        filePath TEXT NULL,
        status TEXT NOT NULL DEFAULT 'New',
        taskNumber INTEGER NULL
      )
    `);

    // Add new columns for migration (same as full version)
    try {
      this.db.exec(`ALTER TABLE todos ADD COLUMN filePath TEXT NULL`);
    } catch (error) {
      // Column already exists, ignore error
    }
    
    try {
      this.db.exec(`ALTER TABLE todos ADD COLUMN status TEXT NOT NULL DEFAULT 'New'`);
    } catch (error) {
      // Column already exists, ignore error
    }
    
    try {
      this.db.exec(`ALTER TABLE todos ADD COLUMN taskNumber INTEGER NULL`);
    } catch (error) {
      // Column already exists, ignore error
    }
  }

  /**
   * Get the database instance
   */
  getDb(): Database.Database {
    return this.db;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}

// Create a singleton instance
export const databaseService = new DatabaseService();