const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body

    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create(email, password, name)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    )

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
  console.error("REGISTER ERROR:", error);
  res.status(500).json({ message: error.message });
}
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    )

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}
