import Database from "better-sqlite3";
import fs from "fs";

const DB_FILE = "./raffle.db";

if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "");

const db = new Database(DB_FILE);

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS wins (
    id TEXT PRIMARY KEY,
    alias TEXT,
    amount INTEGER,
    value INTEGER,
    potTotal INTEGER,
    timestamp INTEGER
  )
`
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value INTEGER
  )
  `
).run();

export default db;
