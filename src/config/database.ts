import DatabaseConstructor from 'better-sqlite3';
import type { Database } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { ENV } from './env';

let db: Database | null = null;

export function initDb(dbPath: string = ENV.DB_PATH): Database {
    if (db) return db;

    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    db = new DatabaseConstructor(dbPath);

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)
  `);

    db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_todos_updated_at
    AFTER UPDATE ON todos
    BEGIN
      UPDATE todos SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `);

    console.log('✅ Base de datos inicializada correctamente');
    return db;
}

export function getDb(): Database {
    if (!db) throw new Error('La base de datos no ha sido inicializada. Llama a initDb() primero.');
    return db;
}

export function closeDb(): void {
    if (db) {
        db.close();
        db = null;
    }
}