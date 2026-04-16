const { Pool } = require('pg')
const env = require('./env')

const pool = new Pool({
  connectionString: env.databaseUrl,
})

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'todo',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDb,
}
