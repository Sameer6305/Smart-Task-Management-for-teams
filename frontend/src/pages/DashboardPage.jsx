import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { taskService } from '../services/taskService'

function DashboardPage() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks()
      setTasks(data.tasks)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load tasks')
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleCreateTask = async (event) => {
    event.preventDefault()
    if (!newTask.trim()) return

    try {
      setLoading(true)
      await taskService.createTask({ title: newTask })
      setNewTask('')
      await loadTasks()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-600">Manage team tasks in one place.</p>
        </div>
      </div>

      <form onSubmit={handleCreateTask} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-600">No tasks yet. Add your first one.</p>
        ) : (
          tasks.map((task) => (
            <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{task.title}</h3>
              <p className="mt-1 text-xs text-slate-500">Status: {task.status}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default DashboardPage
