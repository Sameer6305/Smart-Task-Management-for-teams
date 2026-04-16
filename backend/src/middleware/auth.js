const jwt = require('jsonwebtoken')
const db = require('../config/db')

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id || decoded.userId

    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    const result = await db.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [userId],
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    const user = result.rows[0]
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access forbidden. Insufficient permissions.' })
      }

      return next()
    } catch (error) {
      return res.status(403).json({ message: 'Access forbidden. Insufficient permissions.' })
    }
  }
}

module.exports = {
  verifyToken,
  requireRole,
}