const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * 获取操作日志列表（按时间倒序分页）
 * 查询参数：
 *   page（可选）- 页码，默认 1
 *   pageSize（可选）- 每页条数，默认 20
 *   sampleId（可选）- 按样本编号过滤
 *   operationType（可选）- 按操作类型过滤 create/update/delete
 */
router.get('/', (req, res) => {
  const pageParam = req.query.page;
  const pageSizeParam = req.query.pageSize;
  const sampleIdParam = req.query.sampleId;
  const operationTypeParam = req.query.operationType;

  const page = pageParam && !isNaN(Number(pageParam)) ? Math.max(1, Number(pageParam)) : 1;
  const pageSize = pageSizeParam && !isNaN(Number(pageSizeParam))
    ? Math.max(1, Math.min(100, Number(pageSizeParam)))
    : 20;

  const whereClauses = [];
  const params = [];

  if (sampleIdParam && !isNaN(Number(sampleIdParam))) {
    whereClauses.push('sample_id = ?');
    params.push(Number(sampleIdParam));
  }

  if (operationTypeParam && ['create', 'update', 'delete'].includes(String(operationTypeParam))) {
    whereClauses.push('operation_type = ?');
    params.push(String(operationTypeParam));
  }

  const whereSql = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';

  const countSql = 'SELECT COUNT(*) as total FROM operation_logs' + whereSql;
  const countResult = db.get(countSql, params);
  const total = countResult.total;

  const offset = (page - 1) * pageSize;
  const dataSql =
    'SELECT * FROM operation_logs' + whereSql + ' ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?';
  const dataParams = [...params, pageSize, offset];
  const rows = db.all(dataSql, dataParams);

  res.json({
    data: rows,
    total,
    page,
    pageSize,
  });
});

module.exports = router;
