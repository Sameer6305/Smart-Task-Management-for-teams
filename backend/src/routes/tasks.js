const express = require('express')
const taskController = require('../controllers/taskController')
const { taskValidation, validate } = require('../middleware/validator')
const { verifyToken, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(verifyToken)

router.post('/', taskValidation, validate, taskController.createTask)
router.get('/', taskController.getAllTasks)
router.get('/statistics', taskController.getStatistics)
router.get('/:id', taskController.getTaskById)
router.put('/:id', taskValidation, validate, taskController.updateTask)
router.delete('/:id', requireRole(['admin']), taskController.deleteTask)

module.exports = router