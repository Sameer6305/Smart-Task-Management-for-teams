const dotenv = require('dotenv')

dotenv.config()

const env = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/taskflow_pro',
  jwtSecret: process.env.JWT_SECRET || 'replace_this_with_a_secure_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
}

module.exports = env
