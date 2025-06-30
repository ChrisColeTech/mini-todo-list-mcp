/**
 * Test setup file - runs before all tests
 */
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Create process-unique test directory to avoid conflicts
const TEST_DB_DIR = join(tmpdir(), '.mini-todo-test-' + process.pid + '-' + Date.now());
const TEST_DB_PATH = join(TEST_DB_DIR, 'test.db');

// Set test database path
process.env.TODO_DB_PATH = TEST_DB_PATH;

beforeAll(() => {
  // Ensure test directory exists
  if (!existsSync(TEST_DB_DIR)) {
    mkdirSync(TEST_DB_DIR, { recursive: true });
  }
});

beforeEach(() => {
  // Clean up database before each test
  if (existsSync(TEST_DB_PATH)) {
    rmSync(TEST_DB_PATH);
  }
});

afterAll(() => {
  // Clean up test directory after all tests
  if (existsSync(TEST_DB_DIR)) {
    rmSync(TEST_DB_DIR, { recursive: true, force: true });
  }
});