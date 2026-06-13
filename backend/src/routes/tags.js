const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * 获取全部标签列表
 */
router.get('/', (_req, res) => {
  const rows = db.all('SELECT * FROM tags ORDER BY id ASC');
  res.json(rows);
});

/**
 * 按 ID 获取单条标签
 */
router.get('/:id', (req, res) => {
  const row = db.get('SELECT * FROM tags WHERE id = ?', [req.params.id]);
  if (!row) {
    return res.status(404).json({ error: '标签不存在' });
  }
  res.json(row);
});

/**
 * 新增标签
 */
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '标签名称为必填项' });
  }

  const existing = db.get('SELECT * FROM tags WHERE name = ?', [name.trim()]);
  if (existing) {
    return res.status(400).json({ error: '标签名称已存在' });
  }

  const result = db.run(
    `INSERT INTO tags (name) VALUES (?)`,
    [name.trim()]
  );

  const created = db.get('SELECT * FROM tags WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(created);
});

/**
 * 更新标签
 */
router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM tags WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '标签不存在' });
  }

  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '标签名称为必填项' });
  }

  const duplicate = db.get('SELECT * FROM tags WHERE name = ? AND id != ?', [name.trim(), req.params.id]);
  if (duplicate) {
    return res.status(400).json({ error: '标签名称已存在' });
  }

  db.run(
    `UPDATE tags SET name = ?, updated_at = datetime('now') WHERE id = ?`,
    [name.trim(), req.params.id]
  );

  const updated = db.get('SELECT * FROM tags WHERE id = ?', [req.params.id]);
  res.json(updated);
});

/**
 * 删除标签
 */
router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM tags WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '标签不存在' });
  }

  db.run('DELETE FROM device_tags WHERE tag_id = ?', [req.params.id]);
  db.run('DELETE FROM tags WHERE id = ?', [req.params.id]);
  res.json({ message: '已删除' });
});

/**
 * 获取指定设备的标签列表
 */
router.get('/device/:deviceId', (req, res) => {
  const device = db.get('SELECT * FROM devices WHERE id = ?', [req.params.deviceId]);
  if (!device) {
    return res.status(404).json({ error: '设备不存在' });
  }

  const rows = db.all(
    `SELECT t.* FROM tags t
     INNER JOIN device_tags dt ON t.id = dt.tag_id
     WHERE dt.device_id = ?
     ORDER BY t.id ASC`,
    [req.params.deviceId]
  );
  res.json(rows);
});

/**
 * 为指定设备绑定标签
 */
router.post('/device/:deviceId/:tagId', (req, res) => {
  const device = db.get('SELECT * FROM devices WHERE id = ?', [req.params.deviceId]);
  if (!device) {
    return res.status(404).json({ error: '设备不存在' });
  }

  const tag = db.get('SELECT * FROM tags WHERE id = ?', [req.params.tagId]);
  if (!tag) {
    return res.status(404).json({ error: '标签不存在' });
  }

  const existing = db.get(
    'SELECT * FROM device_tags WHERE device_id = ? AND tag_id = ?',
    [req.params.deviceId, req.params.tagId]
  );
  if (existing) {
    return res.status(400).json({ error: '该标签已绑定到此设备' });
  }

  db.run(
    `INSERT INTO device_tags (device_id, tag_id) VALUES (?, ?)`,
    [req.params.deviceId, req.params.tagId]
  );

  const rows = db.all(
    `SELECT t.* FROM tags t
     INNER JOIN device_tags dt ON t.id = dt.tag_id
     WHERE dt.device_id = ?
     ORDER BY t.id ASC`,
    [req.params.deviceId]
  );
  res.json(rows);
});

/**
 * 为指定设备解除标签绑定
 */
router.delete('/device/:deviceId/:tagId', (req, res) => {
  const device = db.get('SELECT * FROM devices WHERE id = ?', [req.params.deviceId]);
  if (!device) {
    return res.status(404).json({ error: '设备不存在' });
  }

  const tag = db.get('SELECT * FROM tags WHERE id = ?', [req.params.tagId]);
  if (!tag) {
    return res.status(404).json({ error: '标签不存在' });
  }

  const existing = db.get(
    'SELECT * FROM device_tags WHERE device_id = ? AND tag_id = ?',
    [req.params.deviceId, req.params.tagId]
  );
  if (!existing) {
    return res.status(404).json({ error: '该标签未绑定到此设备' });
  }

  db.run(
    `DELETE FROM device_tags WHERE device_id = ? AND tag_id = ?`,
    [req.params.deviceId, req.params.tagId]
  );

  const rows = db.all(
    `SELECT t.* FROM tags t
     INNER JOIN device_tags dt ON t.id = dt.tag_id
     WHERE dt.device_id = ?
     ORDER BY t.id ASC`,
    [req.params.deviceId]
  );
  res.json(rows);
});

module.exports = router;
