const Task = require('../models/Task')

exports.createTask = async (req, res) => {
  try {
    const tableInfo = await require('../config/db').pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks'"
    );
    console.log("DB TASKS COLUMNS:", tableInfo.rows.map(r => r.column_name).join(', '));
    console.log("REQ BODY:", req.body);
    
    const userId = req.user.id
    const task = await Task.create(userId, req.body)

    return res.status(201).json({ task })
  } catch (err) {
    console.error("TASK ERROR:", err);
    return res.status(400).json({ error: err.message, details: err })
  }
}

exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const role = req.user.role
    const status = req.query.status
    const priority = req.query.priority
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const filters = { status, priority, page, limit }

    const result = role === 'admin'
      ? await Task.getAll(filters)
      : await Task.findByUserId(userId, filters)

    const totalPages = Math.max(1, Math.ceil(result.total / limit))

    return res.status(200).json({
      tasks: result.tasks,
      total: result.total,
      page,
      totalPages,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id
    const task = await Task.findById(taskId)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access forbidden' })
    }

    return res.status(200).json({ task })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id
    const task = await Task.findById(taskId)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access forbidden' })
    }

    const updatedTask = await Task.update(taskId, req.body)

    return res.status(200).json({ task: updatedTask })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id
    const task = await Task.findById(taskId)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access forbidden' })
    }

    const deleted = await Task.delete(taskId)

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' })
    }

    return res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id
    const statistics = await Task.getStatistics(userId)

    return res.status(200).json({ statistics })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

exports.getTasks = exports.getAllTasks
