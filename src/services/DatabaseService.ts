/**
 * DatabaseService.ts - Mini Version
 * 
 * Lightweight JSON-based database service for cross-platform compatibility.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { config, ensureDbFolder } from '../config.js';

interface DatabaseData {
  todos: any[];
  rules: any[];
  nextTodoId: number;
  nextRuleId: number;
}

/**
 * DatabaseService Class - JSON-based for cross-platform compatibility
 */
class DatabaseService {
  private data: DatabaseData;
  private dbPath: string;

  constructor() {
    ensureDbFolder();
    this.dbPath = config.db.path.replace('.db', '.json');
    this.loadData();
  }

  private loadData() {
    if (existsSync(this.dbPath)) {
      try {
        const fileContent = readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (error) {
        // File exists but is corrupted, start fresh
        this.data = this.getDefaultData();
      }
    } else {
      this.data = this.getDefaultData();
    }
    this.saveData();
  }

  private getDefaultData(): DatabaseData {
    return {
      todos: [],
      rules: [],
      nextTodoId: 1,
      nextRuleId: 1
    };
  }

  private saveData() {
    writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  /**
   * Execute a SQL-like query on JSON data
   */
  exec(sql: string): void {
    // No-op for JSON database
  }

  /**
   * Prepare a SQL-like statement
   */
  prepare(sql: string): any {
    return {
      run: (...params: any[]) => this.runQuery(sql, params),
      get: (...params: any[]) => this.getQuery(sql, params),
      all: (...params: any[]) => this.allQuery(sql, params)
    };
  }

  private runQuery(sql: string, params: any[] = []): any {
    const table = this.getTableFromSql(sql);
    
    if (sql.includes('INSERT INTO')) {
      return this.handleInsert(table, sql, params);
    } else if (sql.includes('UPDATE')) {
      return this.handleUpdate(table, sql, params);
    } else if (sql.includes('DELETE')) {
      return this.handleDelete(table, sql, params);
    }
    
    return { changes: 0, lastInsertRowid: 0 };
  }

  private getQuery(sql: string, params: any[] = []): any {
    const results = this.allQuery(sql, params);
    return results.length > 0 ? results[0] : undefined;
  }

  private allQuery(sql: string, params: any[] = []): any[] {
    const table = this.getTableFromSql(sql);
    
    if (table === 'todos') {
      return this.queryTodos(sql, params);
    } else if (table === 'rules') {
      return this.queryRules(sql, params);
    }
    
    return [];
  }

  private getTableFromSql(sql: string): string {
    if (sql.includes('todos')) return 'todos';
    if (sql.includes('rules')) return 'rules';
    return '';
  }

  private handleInsert(table: string, sql: string, params: any[]): any {
    if (table === 'todos') {
      const id = this.data.nextTodoId++;
      const todo = { id, ...this.parseInsertParams(sql, params) };
      this.data.todos.push(todo);
      this.saveData();
      return { changes: 1, lastInsertRowid: id };
    } else if (table === 'rules') {
      const id = this.data.nextRuleId++;
      const rule = { id, ...this.parseInsertParams(sql, params) };
      this.data.rules.push(rule);
      this.saveData();
      return { changes: 1, lastInsertRowid: id };
    }
    return { changes: 0, lastInsertRowid: 0 };
  }

  private handleUpdate(table: string, sql: string, params: any[]): any {
    let changes = 0;
    if (table === 'todos') {
      const id = params[params.length - 1]; // Assuming WHERE id = ? is last param
      const todoIndex = this.data.todos.findIndex(t => t.id === id);
      if (todoIndex !== -1) {
        const updates = this.parseUpdateParams(sql, params);
        Object.assign(this.data.todos[todoIndex], updates);
        changes = 1;
        this.saveData();
      }
    } else if (table === 'rules') {
      const id = params[params.length - 1];
      const ruleIndex = this.data.rules.findIndex(r => r.id === id);
      if (ruleIndex !== -1) {
        const updates = this.parseUpdateParams(sql, params);
        Object.assign(this.data.rules[ruleIndex], updates);
        changes = 1;
        this.saveData();
      }
    }
    return { changes };
  }

  private handleDelete(table: string, sql: string, params: any[]): any {
    let changes = 0;
    if (table === 'todos') {
      if (sql.includes('WHERE id = ?')) {
        const id = params[0];
        const initialLength = this.data.todos.length;
        this.data.todos = this.data.todos.filter(t => t.id !== id);
        changes = initialLength - this.data.todos.length;
      } else {
        // DELETE all
        changes = this.data.todos.length;
        this.data.todos = [];
      }
      this.saveData();
    } else if (table === 'rules') {
      if (sql.includes('WHERE id = ?')) {
        const id = params[0];
        const initialLength = this.data.rules.length;
        this.data.rules = this.data.rules.filter(r => r.id !== id);
        changes = initialLength - this.data.rules.length;
      } else {
        changes = this.data.rules.length;
        this.data.rules = [];
      }
      this.saveData();
    }
    return { changes };
  }

  private queryTodos(sql: string, params: any[]): any[] {
    let todos = [...this.data.todos];
    
    // Handle WHERE clauses
    if (sql.includes('WHERE id = ?')) {
      const id = params[0];
      todos = todos.filter(t => t.id === id);
    } else if (sql.includes("WHERE status != 'Done'")) {
      todos = todos.filter(t => t.status !== 'Done');
    }
    
    // Handle ORDER BY
    if (sql.includes('ORDER BY taskNumber ASC')) {
      todos.sort((a, b) => (a.taskNumber || 0) - (b.taskNumber || 0));
    }
    
    // Handle LIMIT
    if (sql.includes('LIMIT 1')) {
      todos = todos.slice(0, 1);
    }
    
    return todos;
  }

  private queryRules(sql: string, params: any[]): any[] {
    let rules = [...this.data.rules];
    
    if (sql.includes('WHERE id = ?')) {
      const id = params[0];
      rules = rules.filter(r => r.id === id);
    }
    
    return rules;
  }

  private parseInsertParams(sql: string, params: any[]): any {
    // This is a simplified parser - in a real implementation you'd parse the SQL properly
    const obj: any = {};
    
    if (sql.includes('todos')) {
      const keys = ['title', 'description', 'completedAt', 'createdAt', 'updatedAt', 'filePath', 'status', 'taskNumber'];
      params.forEach((param, index) => {
        if (index < keys.length) {
          obj[keys[index]] = param;
        }
      });
    } else if (sql.includes('rules')) {
      const keys = ['description', 'createdAt', 'updatedAt', 'filePath'];
      params.forEach((param, index) => {
        if (index < keys.length) {
          obj[keys[index]] = param;
        }
      });
    }
    
    return obj;
  }

  private parseUpdateParams(sql: string, params: any[]): any {
    const obj: any = {};
    
    // Simple parser for UPDATE statements
    if (sql.includes('title = ?')) obj.title = params[0];
    if (sql.includes('description = ?')) obj.description = params[params.indexOf(obj.title !== undefined ? obj.title : params[0]) + 1];
    if (sql.includes('completedAt = ?')) obj.completedAt = params.find(p => p !== undefined);
    if (sql.includes('updatedAt = ?')) obj.updatedAt = params[params.length - 2]; // Usually second to last
    
    return obj;
  }

  /**
   * Get the database instance (returns this for compatibility)
   */
  getDb(): any {
    return this;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.saveData();
  }
}

// Create a singleton instance
export const databaseService = new DatabaseService();