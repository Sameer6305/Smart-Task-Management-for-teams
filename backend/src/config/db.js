const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon/Render SSL connections
  },
});

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
}

// ✅ Correct query function (NO recursion)
const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
  connectDB,
};