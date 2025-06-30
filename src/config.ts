/**
 * config.ts - Mini Version
 * 
 * Configuration settings for the mini todo MCP server.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Read version from package.json
const getVersion = (): string => {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    return '1.0.0'; // fallback version
  }
};

/**
 * Configuration object for the mini todo server
 */
export const config = {
  db: {
    path: path.join(os.homedir(), '.mini-todo-mcp', 'todos.db'),
  },
  server: {
    name: 'Mini-Todo-MCP-Server',
    version: getVersion(),
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