const { createApp } = require('../src/server');
const db = require('../src/db');

async function setupTestApp() {
  const app = await createApp({ inMemory: true }, false);
  return app;
}

function teardownTestDb() {
  db.closeDb();
}

module.exports = { setupTestApp, teardownTestDb };
