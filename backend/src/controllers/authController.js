const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const db = require('../config/db')
const generateToken = require('../utils/generateToken')

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { name, email, password } = req.body

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const created = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash],
    )

    const user = created.rows[0]
    const token = generateToken(user.id)

    return res.status(201).json({ user, token })
  } catch (error) {
    return next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { email, password } = req.body

    const userRes = await db.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email],
    )

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const userRecord = userRes.rows[0]
    const isMatch = await bcrypt.compare(password, userRecord.password_hash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(userRecord.id)
    const user = { id: userRecord.id, name: userRecord.name, email: userRecord.email }

    return res.status(200).json({ user, token })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  register,
  login,
}
