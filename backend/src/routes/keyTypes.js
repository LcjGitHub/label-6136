const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (_req, res) => {
  const rows = db.all('SELECT * FROM key_types ORDER BY id ASC');
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.get('SELECT * FROM key_types WHERE id = ?', [req.params.id]);
  if (!row) {
    return res.status(404).json({ error: '按键类型不存在' });
  }
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: '类型名称为必填项' });
  }

  const existing = db.get('SELECT * FROM key_types WHERE name = ?', [name]);
  if (existing) {
    return res.status(409).json({ error: '类型名称已存在' });
  }

  const result = db.run(
    `INSERT INTO key_types (name, description)
     VALUES (?, ?)`,
    [name, description ?? '']
  );

  const created = db.get('SELECT * FROM key_types WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM key_types WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '按键类型不存在' });
  }

  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: '类型名称为必填项' });
  }

  const duplicate = db.get('SELECT * FROM key_types WHERE name = ? AND id != ?', [name, req.params.id]);
  if (duplicate) {
    return res.status(409).json({ error: '类型名称已存在' });
  }

  db.run(
    `UPDATE key_types
     SET name = ?, description = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
    [name, description ?? '', req.params.id]
  );

  const updated = db.get('SELECT * FROM key_types WHERE id = ?', [req.params.id]);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM key_types WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '按键类型不存在' });
  }

  db.run('DELETE FROM key_types WHERE id = ?', [req.params.id]);
  res.json({ message: '已删除' });
});

module.exports = router;
