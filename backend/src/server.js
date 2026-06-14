const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { seed } = require('./seed');
const devicesRouter = require('./routes/devices');
const collectorsRouter = require('./routes/collectors');
const keyTypesRouter = require('./routes/keyTypes');
const tagsRouter = require('./routes/tags');
const collectionRecordsRouter = require('./routes/collectionRecords');

const PORT = parseInt(process.env.PORT, 10) || 8000;
const FRONTEND_DIST = process.env.FRONTEND_DIST || path.resolve(__dirname, '../../frontend/dist');

/**
 * 创建 Express 应用实例
 * @param {Object} [dbOptions] 数据库初始化选项
 * @param {boolean} [runSeed=false] 是否执行 seed 数据初始化
 * @returns {Promise<express.Express>}
 */
async function createApp(dbOptions = {}, runSeed = false) {
  await db.initDb(dbOptions);

  if (runSeed) {
    seed();
  }

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/devices', devicesRouter);
  app.use('/api/collectors', collectorsRouter);
  app.use('/api/key-types', keyTypesRouter);
  app.use('/api/tags', tagsRouter);
  app.use('/api/collection-records', collectionRecordsRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const fs = require('fs');
  if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
    });
    console.log(`生产模式：已挂载前端静态文件 (${FRONTEND_DIST})`);
  }

  return app;
}

async function start() {
  const app = await createApp({}, true);
  app.listen(PORT, () => {
    console.log(`后端服务运行于 http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('启动失败:', err);
    process.exit(1);
  });
}

module.exports = { createApp };
