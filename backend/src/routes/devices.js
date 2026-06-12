const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * 获取全部设备列表
 */
router.get('/', (_req, res) => {
  const rows = db.all('SELECT * FROM devices ORDER BY id ASC');
  res.json(rows);
});

/**
 * 按 ID 获取单条设备
 */
router.get('/:id', (req, res) => {
  const row = db.get('SELECT * FROM devices WHERE id = ?', [req.params.id]);
  if (!row) {
    return res.status(404).json({ error: '设备不存在' });
  }
  res.json(row);
});

/**
 * 新增设备
 */
router.post('/', (req, res) => {
  const { brand_model, era, key_type, sound_description, location } = req.body;
  if (!brand_model || !era || !key_type || !sound_description || !location) {
    return res.status(400).json({ error: '所有字段均为必填' });
  }

  const result = db.run(
    `INSERT INTO devices (brand_model, era, key_type, sound_description, location)
     VALUES (?, ?, ?, ?, ?)`,
    [brand_model, era, key_type, sound_description, location]
  );

  const created = db.get('SELECT * FROM devices WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(created);
});

/**
 * 更新设备
 */
router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM devices WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '设备不存在' });
  }

  const { brand_model, era, key_type, sound_description, location } = req.body;
  if (!brand_model || !era || !key_type || !sound_description || !location) {
    return res.status(400).json({ error: '所有字段均为必填' });
  }

  db.run(
    `UPDATE devices
     SET brand_model = ?, era = ?, key_type = ?, sound_description = ?, location = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
    [brand_model, era, key_type, sound_description, location, req.params.id]
  );

  const updated = db.get('SELECT * FROM devices WHERE id = ?', [req.params.id]);
  res.json(updated);
});

/**
 * 删除设备
 */
router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM devices WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '设备不存在' });
  }

  db.run('DELETE FROM devices WHERE id = ?', [req.params.id]);
  res.json({ message: '已删除' });
});

module.exports = router;
