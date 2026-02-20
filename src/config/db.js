const mongoose = require('mongoose');
const { mongoUri } = require('./env');

const dbState = { mongoEnabled: false };

async function connectDatabase() {
  if (!mongoUri) {
    return;
  }

  await mongoose.connect(mongoUri);
  dbState.mongoEnabled = true;
}

module.exports = { connectDatabase, dbState };
