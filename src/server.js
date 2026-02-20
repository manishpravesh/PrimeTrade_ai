const { app } = require('./app');
const { connectDatabase } = require('./config/db');
const { port, defaultAdminEmail, defaultAdminPassword } = require('./config/env');
const { ensureDefaultAdmin } = require('./services/store');

async function startServer() {
  await connectDatabase();
  await ensureDefaultAdmin(defaultAdminEmail, defaultAdminPassword);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  });
}

module.exports = { startServer };
