const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const defaultDataDir = path.join(__dirname, '..', 'data');
const defaultDbPath = path.join(defaultDataDir, 'cashregister.db');

/** @type {import('sql.js').Database | null} */
let db = null;
let currentDbPath = defaultDbPath;
let inMemoryMode = false;

/**
 * 将内存数据库持久化到磁盘（内存模式下不执行）
 */
function persist() {
  if (!db || inMemoryMode) return;
  const data = db.export();
  fs.writeFileSync(currentDbPath, Buffer.from(data));
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
 * 关闭当前数据库连接并清理状态
 */
function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
  currentDbPath = defaultDbPath;
  inMemoryMode = false;
}

/**
 * 初始化 SQLite 数据库
 * @param {Object} [options] 初始化选项
 * @param {string} [options.dbPath] 自定义数据库文件路径
 * @param {boolean} [options.inMemory] 是否使用内存模式（不持久化到磁盘）
 */
async function initDb(options = {}) {
  const { dbPath: customDbPath, inMemory = false } = options;

  closeDb();

  inMemoryMode = inMemory;
  if (customDbPath) {
    currentDbPath = customDbPath;
  } else {
    currentDbPath = defaultDbPath;
  }

  if (!inMemoryMode) {
    const dataDir = path.dirname(currentDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  const SQL = await initSqlJs();
  if (!inMemoryMode && fs.existsSync(currentDbPath)) {
    const buffer = fs.readFileSync(currentDbPath);
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
      sound_rating INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  try {
    exec('ALTER TABLE devices ADD COLUMN sound_rating INTEGER');
  } catch (e) {
  }

  exec(`
    CREATE TABLE IF NOT EXISTS collectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact TEXT,
      remark TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS key_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS eras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS device_tags (
      device_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (device_id, tag_id),
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS collection_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sample_id INTEGER NOT NULL,
      collector_id INTEGER NOT NULL,
      collection_date TEXT NOT NULL,
      site_note TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sample_id) REFERENCES devices(id) ON DELETE CASCADE,
      FOREIGN KEY (collector_id) REFERENCES collectors(id) ON DELETE CASCADE
    )
  `);

  exec(`
    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
      sample_id INTEGER NOT NULL,
      sample_brand_model TEXT NOT NULL,
      change_summary TEXT NOT NULL DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  exec('CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at DESC)');
  exec('CREATE INDEX IF NOT EXISTS idx_operation_logs_sample_id ON operation_logs(sample_id)');
}

module.exports = { initDb, closeDb, all, get, run, exec };
