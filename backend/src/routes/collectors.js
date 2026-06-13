const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * 获取全部采集者列表
 */
router.get('/', (_req, res) => {
  const rows = db.all('SELECT * FROM collectors ORDER BY id ASC');
  res.json(rows);
});

/**
 * 按 ID 获取单条采集者
 */
router.get('/:id', (req, res) => {
  const row = db.get('SELECT * FROM collectors WHERE id = ?', [req.params.id]);
  if (!row) {
    return res.status(404).json({ error: '采集者不存在' });
  }
  res.json(row);
});

/**
 * 新增采集者
 */
router.post('/', (req, res) => {
  const { name, contact, remark } = req.body;
  if (!name) {
    return res.status(400).json({ error: '姓名为必填项' });
  }

  const result = db.run(
    `INSERT INTO collectors (name, contact, remark)
     VALUES (?, ?, ?)`,
    [name, contact ?? '', remark ?? '']
  );

  const created = db.get('SELECT * FROM collectors WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(created);
});

/**
 * 更新采集者
 */
router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM collectors WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '采集者不存在' });
  }

  const { name, contact, remark } = req.body;
  if (!name) {
    return res.status(400).json({ error: '姓名为必填项' });
  }

  db.run(
    `UPDATE collectors
     SET name = ?, contact = ?, remark = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
    [name, contact ?? '', remark ?? '', req.params.id]
  );

  const updated = db.get('SELECT * FROM collectors WHERE id = ?', [req.params.id]);
  res.json(updated);
});

/**
 * 删除采集者
 */
router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM collectors WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '采集者不存在' });
  }

  db.run('DELETE FROM collectors WHERE id = ?', [req.params.id]);
  res.json({ message: '已删除' });
});

module.exports = router;
