const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (_req, res) => {
  const rows = db.all('SELECT * FROM eras ORDER BY id ASC');
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.get('SELECT * FROM eras WHERE id = ?', [req.params.id]);
  if (!row) {
    return res.status(404).json({ error: '年代不存在' });
  }
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  const trimmedName = name ? name.trim() : '';
  if (!trimmedName) {
    return res.status(400).json({ error: '年代名称为必填项' });
  }

  const existing = db.get('SELECT * FROM eras WHERE name = ?', [trimmedName]);
  if (existing) {
    return res.status(409).json({ error: '年代名称已存在' });
  }

  const result = db.run(
    `INSERT INTO eras (name, description)
     VALUES (?, ?)`,
    [trimmedName, (description ?? '').trim()]
  );

  const created = db.get('SELECT * FROM eras WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM eras WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '年代不存在' });
  }

  const { name, description } = req.body;
  const trimmedName = name ? name.trim() : '';
  if (!trimmedName) {
    return res.status(400).json({ error: '年代名称为必填项' });
  }

  const duplicate = db.get('SELECT * FROM eras WHERE name = ? AND id != ?', [trimmedName, req.params.id]);
  if (duplicate) {
    return res.status(409).json({ error: '年代名称已存在' });
  }

  db.run(
    `UPDATE eras
     SET name = ?, description = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
    [trimmedName, (description ?? '').trim(), req.params.id]
  );

  const updated = db.get('SELECT * FROM eras WHERE id = ?', [req.params.id]);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM eras WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '年代不存在' });
  }

  const usedCount = db.get(
    'SELECT COUNT(*) AS cnt FROM devices WHERE era = ?',
    [existing.name]
  );
  if (usedCount && usedCount.cnt > 0) {
    return res.status(400).json({ error: '该年代已被样本使用，无法删除' });
  }

  db.run('DELETE FROM eras WHERE id = ?', [req.params.id]);
  res.json({ message: '已删除' });
});

module.exports = router;
