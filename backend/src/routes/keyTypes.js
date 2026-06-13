const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * 获取全部按键类型列表
 */
router.get('/', (_req, res) => {
  const rows = db.all('SELECT * FROM key_types ORDER BY id ASC');
  res.json(rows);
});

/**
 * 按 ID 获取单条按键类型
 */
router.get('/:id', (req, res) => {
  const row = db.get('SELECT * FROM key_types WHERE id = ?', [req.params.id]);
  if (!row) {
    return res.status(404).json({ error: '按键类型不存在' });
  }
  res.json(row);
});

/**
 * 新增按键类型
 */
router.post('/', (req, res) => {
  const { name, description } = req.body;
  const trimmedName = name ? name.trim() : '';
  if (!trimmedName) {
    return res.status(400).json({ error: '类型名称为必填项' });
  }

  const existing = db.get('SELECT * FROM key_types WHERE name = ?', [trimmedName]);
  if (existing) {
    return res.status(409).json({ error: '类型名称已存在' });
  }

  const result = db.run(
    `INSERT INTO key_types (name, description)
     VALUES (?, ?)`,
    [trimmedName, (description ?? '').trim()]
  );

  const created = db.get('SELECT * FROM key_types WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(created);
});

/**
 * 更新按键类型
 */
router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM key_types WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '按键类型不存在' });
  }

  const { name, description } = req.body;
  const trimmedName = name ? name.trim() : '';
  if (!trimmedName) {
    return res.status(400).json({ error: '类型名称为必填项' });
  }

  const duplicate = db.get('SELECT * FROM key_types WHERE name = ? AND id != ?', [trimmedName, req.params.id]);
  if (duplicate) {
    return res.status(409).json({ error: '类型名称已存在' });
  }

  db.run(
    `UPDATE key_types
     SET name = ?, description = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
    [trimmedName, (description ?? '').trim(), req.params.id]
  );

  const updated = db.get('SELECT * FROM key_types WHERE id = ?', [req.params.id]);
  res.json(updated);
});

/**
 * 删除按键类型
 */
router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM key_types WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '按键类型不存在' });
  }

  const usedCount = db.get(
    'SELECT COUNT(*) AS cnt FROM devices WHERE key_type = ?',
    [existing.name]
  );
  if (usedCount && usedCount.cnt > 0) {
    return res.status(400).json({ error: '该类型已被样本使用，无法删除' });
  }

  db.run('DELETE FROM key_types WHERE id = ?', [req.params.id]);
  res.json({ message: '已删除' });
});

module.exports = router;
