const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * 获取设备关联的标签
 */
function getTagsForDevice(deviceId) {
  return db.all(
    `SELECT t.* FROM tags t
     INNER JOIN device_tags dt ON t.id = dt.tag_id
     WHERE dt.device_id = ?
     ORDER BY t.id ASC`,
    [deviceId]
  );
}

/**
 * 写入操作日志
 */
function writeOperationLog(operationType, sampleId, sampleBrandModel, changeSummary = '') {
  db.run(
    `INSERT INTO operation_logs (operation_type, sample_id, sample_brand_model, change_summary)
     VALUES (?, ?, ?, ?)`,
    [operationType, sampleId, sampleBrandModel, changeSummary]
  );
}

/**
 * 生成变更摘要：对比 old 和 new 对象，返回变化的字段描述
 */
function buildChangeSummary(oldObj, newObj) {
  const fieldLabels = {
    brand_model: '品牌型号',
    era: '年代',
    key_type: '按键类型',
    sound_description: '声音描述',
    location: '获取地点',
    sound_rating: '音质评分',
  };

  const changes = [];
  for (const key of Object.keys(fieldLabels)) {
    const oldVal = oldObj?.[key];
    const newVal = newObj?.[key];
    const oldStr = oldVal === null || oldVal === undefined ? '(空)' : String(oldVal);
    const newStr = newVal === null || newVal === undefined ? '(空)' : String(newVal);
    if (oldStr !== newStr) {
      const label = fieldLabels[key];
      changes.push(`${label}: "${truncate(oldStr, 30)}" → "${truncate(newStr, 30)}"`);
    }
  }

  return changes.length > 0 ? changes.join('；') : '无字段变更';
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

/**
 * 校验音质评分：必须是 1-5 的整数，或 null/undefined
 */
function validateSoundRating(rating) {
  if (rating === undefined || rating === null || rating === '') {
    return null;
  }
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return false;
  }
  return num;
}

/**
 * 获取统计数据
 * 返回：样本总数、各年代分组数量、各按键类型分组数量
 */
router.get('/statistics', (_req, res) => {
  const totalResult = db.get('SELECT COUNT(*) as total FROM devices');
  const total = totalResult.total;

  const eraGroups = db.all(
    'SELECT era as name, COUNT(*) as count FROM devices GROUP BY era ORDER BY count DESC, era ASC'
  );

  const keyTypeGroups = db.all(
    'SELECT key_type as name, COUNT(*) as count FROM devices GROUP BY key_type ORDER BY count DESC, key_type ASC'
  );

  res.json({
    total,
    eraGroups,
    keyTypeGroups,
  });
});

/**
 * 获取设备列表（支持分页和搜索）
 * 查询参数：
 *   keyword（可选）- 按品牌型号、获取地点、声音描述模糊匹配
 *   page（可选）- 页码，默认 1
 *   pageSize（可选）- 每页条数，默认全部
 */
router.get('/', (req, res) => {
  const keyword = req.query.keyword;
  const pageParam = req.query.page;
  const pageSizeParam = req.query.pageSize;

  const page = pageParam && !isNaN(Number(pageParam)) ? Math.max(1, Number(pageParam)) : 1;
  const pageSize = pageSizeParam && !isNaN(Number(pageSizeParam)) ? Math.max(1, Number(pageSizeParam)) : null;

  let countSql = 'SELECT COUNT(*) as total FROM devices';
  let dataSql = 'SELECT * FROM devices';
  const params = [];

  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const searchTerm = `%${keyword.trim()}%`;
    const whereClause = ' WHERE brand_model LIKE ? OR location LIKE ? OR sound_description LIKE ?';
    countSql += whereClause;
    dataSql += whereClause;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  dataSql += ' ORDER BY id ASC';

  if (pageSize) {
    const offset = (page - 1) * pageSize;
    dataSql += ' LIMIT ? OFFSET ?';
    params.push(pageSize, offset);
  }

  const countResult = db.get(countSql, params.slice(0, countSql.includes('WHERE') ? 3 : 0));
  const total = countResult.total;

  const rows = db.all(dataSql, params);

  const devicesWithTags = rows.map((device) => ({
    ...device,
    tags: getTagsForDevice(device.id),
  }));

  res.json({
    data: devicesWithTags,
    total,
    page,
    pageSize: pageSize || total,
  });
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
    if (item.sound_rating !== undefined && item.sound_rating !== null) {
      const rating = validateSoundRating(item.sound_rating);
      if (rating === false) {
        return res.status(400).json({
          error: `第 ${i + 1} 条数据的「音质评分」必须是 1-5 的整数`,
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

    const placeholders = data.map(() => '(?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))').join(', ');
    const values = data.flatMap((item) => [
      item.brand_model.trim(),
      item.era.trim(),
      item.key_type.trim(),
      item.sound_description.trim(),
      item.location.trim(),
      validateSoundRating(item.sound_rating),
    ]);

    db.run(
      `INSERT INTO devices (brand_model, era, key_type, sound_description, location, sound_rating, created_at, updated_at)
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
  const deviceWithTags = {
    ...row,
    tags: getTagsForDevice(row.id),
  };
  res.json(deviceWithTags);
});

/**
 * 新增设备
 */
router.post('/', (req, res) => {
  const { brand_model, era, key_type, sound_description, location, sound_rating } = req.body;
  if (!brand_model || !era || !key_type || !sound_description || !location) {
    return res.status(400).json({ error: '所有字段均为必填' });
  }

  const rating = validateSoundRating(sound_rating);
  if (rating === false) {
    return res.status(400).json({ error: '音质评分必须是 1-5 的整数' });
  }

  const result = db.run(
    `INSERT INTO devices (brand_model, era, key_type, sound_description, location, sound_rating)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [brand_model, era, key_type, sound_description, location, rating]
  );

  const created = db.get('SELECT * FROM devices WHERE id = ?', [result.lastInsertRowid]);

  const summaryParts = [];
  summaryParts.push(`品牌型号: "${truncate(brand_model, 30)}"`);
  summaryParts.push(`年代: "${era}"`);
  summaryParts.push(`按键类型: "${key_type}"`);
  if (rating) summaryParts.push(`音质评分: ${rating} 分`);
  writeOperationLog('create', created.id, brand_model, summaryParts.join('；'));

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

  const { brand_model, era, key_type, sound_description, location, sound_rating } = req.body;
  if (!brand_model || !era || !key_type || !sound_description || !location) {
    return res.status(400).json({ error: '所有字段均为必填' });
  }

  const rating = validateSoundRating(sound_rating);
  if (rating === false) {
    return res.status(400).json({ error: '音质评分必须是 1-5 的整数' });
  }

  const newData = { brand_model, era, key_type, sound_description, location, sound_rating: rating };
  const changeSummary = buildChangeSummary(existing, newData);

  db.run(
    `UPDATE devices
     SET brand_model = ?, era = ?, key_type = ?, sound_description = ?, location = ?,
         sound_rating = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [brand_model, era, key_type, sound_description, location, rating, req.params.id]
  );

  const updated = db.get('SELECT * FROM devices WHERE id = ?', [req.params.id]);

  writeOperationLog('update', updated.id, updated.brand_model, changeSummary);

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

  const summaryParts = [];
  summaryParts.push(`品牌型号: "${truncate(existing.brand_model, 30)}"`);
  summaryParts.push(`年代: "${existing.era}"`);
  summaryParts.push(`按键类型: "${existing.key_type}"`);
  writeOperationLog('delete', existing.id, existing.brand_model, summaryParts.join('；'));

  db.run('DELETE FROM devices WHERE id = ?', [req.params.id]);
  res.json({ message: '已删除' });
});

module.exports = router;
