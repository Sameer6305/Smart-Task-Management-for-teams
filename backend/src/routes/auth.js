const express = require('express')
const authController = require('../controllers/authController')
const { registerValidation, loginValidation, validate } = require('../middleware/validator')
const { verifyToken } = require('../middleware/auth')

const router = express.Router()

router.post('/register', registerValidation, validate, authController.register)
router.post('/login', loginValidation, validate, authController.login)
router.get('/profile', verifyToken, authController.getProfile)

module.exports = router