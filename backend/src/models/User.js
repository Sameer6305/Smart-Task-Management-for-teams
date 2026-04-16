const pool = require('../config/db')
const bcrypt = require('bcryptjs')

class User {
  static async create(email, password, name, role = 'user') {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await pool.query(
        `INSERT INTO users (email, password, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role, created_at, updated_at`,
        [email, hashedPassword, name, role],
      )

      return result.rows[0]
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists')
      }
      throw error
    }
  }

  static async findByEmail(email) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

      return result.rows[0] || null
    } catch (error) {
      throw error
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1`,
        [id],
      )

      return result.rows[0] || null
    } catch (error) {
      throw error
    }
  }

  static async getAll() {
    try {
      const result = await pool.query(
        `SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC`,
      )

      return result.rows
    } catch (error) {
      throw error
    }
  }

  static async update(id, updates) {
    try {
      const allowedFields = ['email', 'name', 'role']
      const updateFields = {}

      for (const field of allowedFields) {
        if (field in updates) {
          updateFields[field] = updates[field]
        }
      }

      if (Object.keys(updateFields).length === 0) {
        const result = await pool.query(
          `SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1`,
          [id],
        )
        return result.rows[0] || null
      }

      const fields = Object.keys(updateFields)
      const values = Object.values(updateFields)
      values.push(id)

      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')

      const result = await pool.query(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1}
         RETURNING id, email, name, role, created_at, updated_at`,
        values,
      )

      return result.rows[0] || null
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists')
      }
      throw error
    }
  }
}

module.exports = User
