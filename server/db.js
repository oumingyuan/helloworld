import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATABASE_DIR || path.join(__dirname, "..", "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dataDir, "helloworld.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS greetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export function listGreetings(limit = 20) {
  return db
    .prepare(
      `SELECT id, name, message, created_at
       FROM greetings
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(limit);
}

export function createGreeting(name, message) {
  const result = db
    .prepare(`INSERT INTO greetings (name, message) VALUES (?, ?)`)
    .run(name, message);

  return db
    .prepare(
      `SELECT id, name, message, created_at
       FROM greetings
       WHERE id = ?`
    )
    .get(result.lastInsertRowid);
}

export { dbPath };
