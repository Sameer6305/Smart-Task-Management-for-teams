require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

// Test database connection
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error.message)
    return false
  }
}

module.exports = pool
module.exports.query = (text, params) => pool.query(text, params)
module.exports.testConnection = testConnection
