const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { seed } = require('./seed');
const devicesRouter = require('./routes/devices');
const collectorsRouter = require('./routes/collectors');
const keyTypesRouter = require('./routes/keyTypes');
const tagsRouter = require('./routes/tags');

const PORT = parseInt(process.env.PORT, 10) || 8000;
const FRONTEND_DIST = process.env.FRONTEND_DIST || path.resolve(__dirname, '../../frontend/dist');

async function start() {
  await db.initDb();
  seed();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/devices', devicesRouter);
  app.use('/api/collectors', collectorsRouter);
  app.use('/api/key-types', keyTypesRouter);
  app.use('/api/tags', tagsRouter);

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

  app.listen(PORT, () => {
    console.log(`后端服务运行于 http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});
