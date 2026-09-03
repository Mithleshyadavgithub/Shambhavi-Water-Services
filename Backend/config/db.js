const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = (process.env.MONGO_URI || '').trim();

    // Strip leading/trailing quotes if pasted with quotes
    if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
      uri = uri.slice(1, -1).trim();
    }
    // Strip accidental 'MONGO_URI=' prefix if copied with variable name
    if (uri.startsWith('MONGO_URI=')) {
      uri = uri.replace(/^MONGO_URI=/, '').trim();
    }
    // Strip accidental trailing period
    if (uri.endsWith('.')) {
      uri = uri.slice(0, -1).trim();
    }

    if (!uri) {
      throw new Error('MONGO_URI environment variable is missing or empty.');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    console.error(`⚠️ Please ensure your IP address is whitelisted in your MongoDB Atlas console.`);
    console.error(`⚠️ Running backend server in database-offline mode. Auto-reconnecting...`);
  }
};

module.exports = connectDB;
