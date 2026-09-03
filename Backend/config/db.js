const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
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
