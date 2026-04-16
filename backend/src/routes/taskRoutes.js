const express = require('express')
const { body } = require('express-validator')
const { createTask, getTasks } = require('../controllers/taskController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/', getTasks)

router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  createTask,
)

module.exports = router
