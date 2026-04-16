const { validationResult } = require('express-validator')
const db = require('../config/db')

const getTasks = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, title, status, created_at
       FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id],
    )

    return res.status(200).json({ tasks: result.rows })
  } catch (error) {
    return next(error)
  }
}

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { title } = req.body
    const result = await db.query(
      `INSERT INTO tasks (user_id, title)
       VALUES ($1, $2)
       RETURNING id, title, status, created_at`,
      [req.user.id, title],
    )

    return res.status(201).json({ task: result.rows[0] })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getTasks,
  createTask,
}
