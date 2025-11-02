import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

let db: Database.Database | null = null;

const ensureDirectory = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const runMigrations = (database: Database.Database) => {
  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        start TEXT NOT NULL,
        end TEXT NOT NULL,
        notes TEXT NOT NULL,
        tag TEXT NOT NULL,
        reminder_method TEXT,
        reminder_minutes INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        taken_at TEXT,
        file_name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();

  database
    .prepare(
      `CREATE TABLE IF NOT EXISTS reminder_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        channel TEXT NOT NULL,
        sent_at TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )`,
    )
    .run();
};

export const getDatabase = (): Database.Database => {
  if (db) {
    return db;
  }

  ensureDirectory(env.databasePath);
  db = new Database(env.databasePath);
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
};
