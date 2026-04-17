const pool = require('../config/db')

class Task {
  static _mapTask(row) {
    if (!row) return row;
    if (row.status === 'todo') row.status = 'pending';
    if (row.status === 'done') row.status = 'completed';
    return row;
  }

  static async create(userId, taskData) {
    try {
      const title = taskData.title;
      const description = taskData.description || null;
      let status = taskData.status || 'todo';
      if (status === 'pending') status = 'todo';
      if (status === 'completed') status = 'done';
      
      const priority = taskData.priority || 'medium';
      const due_date = taskData.due_date || taskData.dueDate || null;

      const result = await pool.query(
        `INSERT INTO tasks 
         (title, description, status, priority, due_date, user_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          title,
          description || null,
          status,
          priority,
          due_date || null,
          userId, // from JWT
        ]
      );

      return Task._mapTask(result.rows[0])
    } catch (error) {
      throw error
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT t.id, t.user_id, t.title, t.description, t.status, t.priority, t.due_date, 
                t.created_at, t.updated_at, u.id as user_id, u.email, u.name
         FROM tasks t
         JOIN users u ON t.user_id = u.id
         WHERE t.id = $1`,
        [id],
      )

      return Task._mapTask(result.rows[0] || null)
    } catch (error) {
      throw error
    }
  }

  static async findByUserId(userId, { status, priority, page = 1, limit = 10 }) {
    try {
      let whereClause = 't.user_id = $1'
      const params = [userId]
      let paramIndex = 2

      if (status) {
        let sc = status
        if (sc === 'pending') sc = 'todo'
        if (sc === 'completed') sc = 'done'
        whereClause += ` AND t.status = $${paramIndex}`
        params.push(sc)
        paramIndex++
      }

      if (priority) {
        whereClause += ` AND t.priority = $${paramIndex}`
        params.push(priority)
        paramIndex++
      }

      const offset = (page - 1) * limit

      const countResult = await pool.query(
        `SELECT COUNT(*) as count FROM tasks t WHERE ${whereClause}`,
        params,
      )
      const total = parseInt(countResult.rows[0].count)

      const tasksQuery = `SELECT t.id, t.user_id, t.title, t.description, t.status, t.priority, t.due_date,
                                  t.created_at, t.updated_at
                           FROM tasks t
                           WHERE ${whereClause}
                           ORDER BY t.created_at DESC
                           LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`

      params.push(limit, offset)

      const tasksResult = await pool.query(tasksQuery, params)

      return {
        tasks: tasksResult.rows.map(Task._mapTask),
        total: total,
      }
    } catch (error) {
      throw error
    }
  }

  static async getAll({ status, priority, page = 1, limit = 10 }) {
    try {
      let whereClause = ''
      const params = []
      let paramIndex = 1

      if (status) {
        let sc = status
        if (sc === 'pending') sc = 'todo'
        if (sc === 'completed') sc = 'done'
        whereClause += `t.status = $${paramIndex}`
        params.push(sc)
        paramIndex++
      }

      if (priority) {
        if (whereClause) whereClause += ' AND '
        whereClause += `t.priority = $${paramIndex}`
        params.push(priority)
        paramIndex++
      }

      const whereSQL = whereClause ? `WHERE ${whereClause}` : ''

      const countResult = await pool.query(
        `SELECT COUNT(*) as count FROM tasks t ${whereSQL}`,
        params,
      )
      const total = parseInt(countResult.rows[0].count)

      const offset = (page - 1) * limit

      const tasksQuery = `SELECT t.id, t.user_id, t.title, t.description, t.status, t.priority, t.due_date,
                                  t.created_at, t.updated_at, u.id as user_id, u.email, u.name
                           FROM tasks t
                           JOIN users u ON t.user_id = u.id
                           ${whereSQL}
                           ORDER BY t.created_at DESC
                           LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`

      params.push(limit, offset)

      const tasksResult = await pool.query(tasksQuery, params)

      return {
        tasks: tasksResult.rows.map(Task._mapTask),
        total: total,
      }
    } catch (error) {
      throw error
    }
  }

  static async update(id, updates) {
    try {
      const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate']
      const updateFields = {}

      for (const field of allowedFields) {
        if (field in updates) {
          if (field === 'dueDate') {
            updateFields['due_date'] = updates[field]
          } else if (field === 'status') {
            let sc = updates[field]
            if (sc === 'pending') sc = 'todo'
            if (sc === 'completed') sc = 'done'
            updateFields[field] = sc
          } else {
            updateFields[field] = updates[field]
          }
        }
      }

      if (Object.keys(updateFields).length === 0) {
        const result = await pool.query(
          `SELECT id, user_id, title, description, status, priority, due_date, created_at, updated_at
           FROM tasks WHERE id = $1`,
          [id],
        )
        return Task._mapTask(result.rows[0] || null)
      }

      const fields = Object.keys(updateFields)
      const values = Object.values(updateFields)
      values.push(id)

      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')

      const result = await pool.query(
        `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1}
         RETURNING id, user_id, title, description, status, priority, due_date, created_at, updated_at`,
        values,
      )

      return Task._mapTask(result.rows[0] || null)
    } catch (error) {
      throw error
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id])

      return result.rowCount > 0
    } catch (error) {
      throw error
    }
  }

  static async getStatistics(userId) {
    try {
      const result = await pool.query(
        `SELECT 
           COUNT(*) as total,
           COUNT(CASE WHEN status = 'todo' THEN 1 END) as pending,
           COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
           COUNT(CASE WHEN status = 'done' THEN 1 END) as completed
         FROM tasks
         WHERE user_id = $1`,
        [userId],
      )

      const stats = result.rows[0]
      return {
        total: parseInt(stats.total),
        pending: parseInt(stats.pending),
        in_progress: parseInt(stats.in_progress),
        completed: parseInt(stats.completed),
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = Task
