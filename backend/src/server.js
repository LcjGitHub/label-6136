const express = require('express');
const cors = require('cors');
const db = require('./db');
const { seed } = require('./seed');
const devicesRouter = require('./routes/devices');
const collectorsRouter = require('./routes/collectors');
const keyTypesRouter = require('./routes/keyTypes');

const PORT = 8000;

/**
 * 启动 Express 服务
 */
async function start() {
  await db.initDb();
  seed();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/devices', devicesRouter);
  app.use('/api/collectors', collectorsRouter);
  app.use('/api/key-types', keyTypesRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(PORT, () => {
    console.log(`后端服务运行于 http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});
