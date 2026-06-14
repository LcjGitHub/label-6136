const express = require('express');
const db = require('../db');

const router = express.Router();

function getCollectionRecordWithDetails(row) {
  if (!row) return null;
  const sample = db.get(
    'SELECT id, brand_model FROM devices WHERE id = ?',
    [row.sample_id]
  );
  const collector = db.get(
    'SELECT id, name FROM collectors WHERE id = ?',
    [row.collector_id]
  );
  return {
    ...row,
    sample: sample || null,
    collector: collector || null,
  };
}

function validateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

router.get('/', (req, res) => {
  const { sample_id, collector_id } = req.query;

  let sql = 'SELECT * FROM collection_records';
  const params = [];
  const whereClauses = [];

  if (sample_id && !isNaN(Number(sample_id))) {
    whereClauses.push('sample_id = ?');
    params.push(Number(sample_id));
  }

  if (collector_id && !isNaN(Number(collector_id))) {
    whereClauses.push('collector_id = ?');
    params.push(Number(collector_id));
  }

  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }

  sql += ' ORDER BY id DESC';

  const rows = db.all(sql, params);
  const records = rows.map(getCollectionRecordWithDetails);
  res.json(records);
});

router.get('/:id', (req, res) => {
  const row = db.get('SELECT * FROM collection_records WHERE id = ?', [req.params.id]);
  if (!row) {
    return res.status(404).json({ error: '采集记录不存在' });
  }
  res.json(getCollectionRecordWithDetails(row));
});

router.post('/', (req, res) => {
  const { sample_id, collector_id, collection_date, site_note } = req.body;

  if (!sample_id || isNaN(Number(sample_id))) {
    return res.status(400).json({ error: '关联样本编号为必填项' });
  }
  if (!collector_id || isNaN(Number(collector_id))) {
    return res.status(400).json({ error: '关联采集者编号为必填项' });
  }
  if (!validateDate(collection_date)) {
    return res.status(400).json({ error: '采集日期格式无效' });
  }

  const sampleExists = db.get('SELECT id FROM devices WHERE id = ?', [sample_id]);
  if (!sampleExists) {
    return res.status(400).json({ error: '关联的样本不存在' });
  }

  const collectorExists = db.get('SELECT id FROM collectors WHERE id = ?', [collector_id]);
  if (!collectorExists) {
    return res.status(400).json({ error: '关联的采集者不存在' });
  }

  const result = db.run(
    `INSERT INTO collection_records (sample_id, collector_id, collection_date, site_note)
     VALUES (?, ?, ?, ?)`,
    [
      Number(sample_id),
      Number(collector_id),
      collection_date.trim(),
      site_note ?? '',
    ]
  );

  const created = db.get('SELECT * FROM collection_records WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(getCollectionRecordWithDetails(created));
});

router.put('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM collection_records WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '采集记录不存在' });
  }

  const { sample_id, collector_id, collection_date, site_note } = req.body;

  if (!sample_id || isNaN(Number(sample_id))) {
    return res.status(400).json({ error: '关联样本编号为必填项' });
  }
  if (!collector_id || isNaN(Number(collector_id))) {
    return res.status(400).json({ error: '关联采集者编号为必填项' });
  }
  if (!validateDate(collection_date)) {
    return res.status(400).json({ error: '采集日期格式无效' });
  }

  const sampleExists = db.get('SELECT id FROM devices WHERE id = ?', [sample_id]);
  if (!sampleExists) {
    return res.status(400).json({ error: '关联的样本不存在' });
  }

  const collectorExists = db.get('SELECT id FROM collectors WHERE id = ?', [collector_id]);
  if (!collectorExists) {
    return res.status(400).json({ error: '关联的采集者不存在' });
  }

  db.run(
    `UPDATE collection_records
     SET sample_id = ?, collector_id = ?, collection_date = ?, site_note = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
    [
      Number(sample_id),
      Number(collector_id),
      collection_date.trim(),
      site_note ?? '',
      req.params.id,
    ]
  );

  const updated = db.get('SELECT * FROM collection_records WHERE id = ?', [req.params.id]);
  res.json(getCollectionRecordWithDetails(updated));
});

router.delete('/:id', (req, res) => {
  const existing = db.get('SELECT * FROM collection_records WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: '采集记录不存在' });
  }

  db.run('DELETE FROM collection_records WHERE id = ?', [req.params.id]);
  res.json({ message: '已删除' });
});

module.exports = router;
