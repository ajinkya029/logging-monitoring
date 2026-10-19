require('dotenv').config();
const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');

const port = Number(process.env.PORT || 5000);

async function start() {
  try {
    await connectDatabase();
    const server = app.listen(port, () => {
      console.log(`Logging & Monitoring API listening on port ${port}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received; shutting down...`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

start();
