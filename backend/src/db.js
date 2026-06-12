const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'cashregister.db');

/** @type {import('sql.js').Database | null} */
let db = null;

/**
 * 将内存数据库持久化到磁盘
 */
function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

/**
 * 执行 SELECT 并返回全部行
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Record<string, unknown>[]}
 */
function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * 执行 SELECT 并返回首行
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {Record<string, unknown> | undefined}
 */
function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0];
}

/**
 * 执行 INSERT / UPDATE / DELETE
 * @param {string} sql
 * @param {unknown[]} [params]
 * @returns {{ lastInsertRowid: number, changes: number }}
 */
function run(sql, params = []) {
  db.run(sql, params);
  const lastInsertRowid = db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0]?.[0] ?? 0;
  const changes = db.getRowsModified();
  persist();
  return { lastInsertRowid: Number(lastInsertRowid), changes };
}

/**
 * 执行 DDL 语句
 * @param {string} sql
 */
function exec(sql) {
  db.run(sql);
  persist();
}

/**
 * 初始化 SQLite 数据库
 */
async function initDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_model TEXT NOT NULL,
      era TEXT NOT NULL,
      key_type TEXT NOT NULL,
      sound_description TEXT NOT NULL,
      location TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

module.exports = { initDb, all, get, run, exec };
