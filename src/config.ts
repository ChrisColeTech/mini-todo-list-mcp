/**
 * config.ts - Mini Version
 * 
 * Configuration settings for the mini todo MCP server.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Configuration object for the mini todo server
 */
export const config = {
  db: {
    path: path.join(os.homedir(), '.mini-todo-mcp', 'todos.db'),
  },
  server: {
    name: 'Mini-Todo-MCP-Server',
    version: '1.0.0',
  },
};

/**
 * Ensure the database folder exists
 */
export function ensureDbFolder(): void {
  const dbDir = path.dirname(config.db.path);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}