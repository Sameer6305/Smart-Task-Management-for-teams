const jwt = require('jsonwebtoken')
const env = require('../config/env')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.jwtSecret)
    req.user = { id: decoded.userId }
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = authMiddleware
