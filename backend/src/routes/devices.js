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
 * 导出全部样本数据
 */
router.get('/export', (_req, res) => {
  const rows = db.all('SELECT * FROM devices ORDER BY id ASC');
  res.json({
    exportTime: new Date().toISOString(),
    count: rows.length,
    data: rows,
  });
});

/**
 * 对比两个样本
 * 查询参数：id1, id2
 * 返回：{ device1, device2 }，若任一不存在返回 404 错误
 */
router.get('/compare', (req, res) => {
  const { id1, id2 } = req.query;

  if (!id1 || !id2) {
    return res.status(400).json({ error: '需提供两个样本编号 id1 和 id2' });
  }

  if (id1 === id2) {
    return res.status(400).json({ error: '两个样本编号不能相同' });
  }

  const device1 = db.get('SELECT * FROM devices WHERE id = ?', [id1]);
  const device2 = db.get('SELECT * FROM devices WHERE id = ?', [id2]);

  if (!device1 && !device2) {
    return res.status(404).json({ error: `两个样本编号（${id1}、${id2}）均不存在` });
  }
  if (!device1) {
    return res.status(404).json({ error: `样本编号 ${id1} 不存在` });
  }
  if (!device2) {
    return res.status(404).json({ error: `样本编号 ${id2} 不存在` });
  }

  res.json({ device1, device2 });
});

/**
 * 还原样本数据
 * 请求体：{ data: Device[], mode: 'overwrite' | 'append' }
 */
router.post('/restore', (req, res) => {
  const { data, mode } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: '数据格式错误，需为数组' });
  }

  if (mode !== 'overwrite' && mode !== 'append') {
    return res.status(400).json({ error: '模式参数错误，需为 overwrite 或 append' });
  }

  const requiredFields = ['brand_model', 'era', 'key_type', 'sound_description', 'location'];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    for (const field of requiredFields) {
      if (!item[field] || typeof item[field] !== 'string' || !item[field].trim()) {
        return res.status(400).json({
          error: `第 ${i + 1} 条数据的「${field}」为必填字段，不能为空`,
        });
      }
    }
  }

  try {
    if (mode === 'overwrite') {
      db.run('DELETE FROM devices');
      db.run("DELETE FROM sqlite_sequence WHERE name = 'devices'");

      if (data.length === 0) {
        return res.json({
          message: '已清空全部样本数据',
          count: 0,
          mode,
          data: [],
        });
      }
    }

    if (data.length === 0) {
      const rows = db.all('SELECT * FROM devices ORDER BY id ASC');
      return res.json({
        message: '追加写入完成，共写入 0 条数据',
        count: 0,
        mode,
        data: rows,
      });
    }

    const placeholders = data.map(() => '(?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))').join(', ');
    const values = data.flatMap((item) => [
      item.brand_model.trim(),
      item.era.trim(),
      item.key_type.trim(),
      item.sound_description.trim(),
      item.location.trim(),
    ]);

    db.run(
      `INSERT INTO devices (brand_model, era, key_type, sound_description, location, created_at, updated_at)
       VALUES ${placeholders}`,
      values
    );

    const rows = db.all('SELECT * FROM devices ORDER BY id ASC');
    res.json({
      message: `还原成功，共写入 ${data.length} 条数据`,
      count: data.length,
      mode,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: '还原失败：' + (err instanceof Error ? err.message : '未知错误') });
  }
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
