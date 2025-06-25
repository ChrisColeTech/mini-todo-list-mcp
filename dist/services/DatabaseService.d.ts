/**
 * DatabaseService.ts - Mini Version
 *
 * Lightweight SQLite database service for the mini todo application.
 */
import Database from 'better-sqlite3';
/**
 * DatabaseService Class - same as full version but with mini branding
 */
declare class DatabaseService {
    private db;
    constructor();
    /**
     * Initialize the database schema - same as full version
     */
    private initSchema;
    /**
     * Get the database instance
     */
    getDb(): Database.Database;
    /**
     * Close the database connection
     */
    close(): void;
}
export declare const databaseService: DatabaseService;
export {};
