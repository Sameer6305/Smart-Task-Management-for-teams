import { useEffect, useState, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  CheckSquare,
  Clock,
  Loader2,
  ListTodo,
  Filter,
  X,
  RefreshCcw,
  ClipboardList,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { taskService } from '../services/taskService'
import StatsCard from '../components/ui/StatsCard'
import TaskCard from '../components/ui/TaskCard'
import TaskModal from '../components/ui/TaskModal'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: '', label: 'All', color: '#6366f1' },
  { value: 'pending', label: 'Pending', color: '#64748b' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#10b981' },
]

const PRIORITY_FILTERS = [
  { value: '', label: 'All Priority', color: '#6366f1' },
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
]

const EMPTY_FILTERS = { status: '', priority: '', search: '' }

const DEFAULT_STATS = { total: 0, pending: 0, in_progress: 0, completed: 0 }

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Filter pill button */
function FilterPill({ label, active, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      style={{
        border: active ? `1.5px solid ${color}` : '1.5px solid #e2e8f0',
        background: active ? `${color}12` : '#fff',
        color: active ? color : '#64748b',
        boxShadow: active ? `0 0 0 3px ${color}1a` : 'none',
      }}
    >
      {label}
    </button>
  )
}

/** Skeleton card for loading state */
function TaskCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton h-6 w-8 rounded-lg" />
      </div>
      <div className="skeleton h-4 w-3/4 rounded-md" />
      <div className="skeleton h-3 w-full rounded-md" />
      <div className="skeleton h-3 w-4/5 rounded-md" />
      <div className="h-px bg-slate-100" />
      <div className="flex flex-col gap-1.5">
        <div className="skeleton h-3 w-32 rounded-md" />
        <div className="skeleton h-3 w-28 rounded-md" />
      </div>
    </div>
  )
}

/** Empty state illustration */
function EmptyState({ hasFilters, onClearFilters, onAddTask }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      {/* Illustration */}
      <div
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl shadow-lg"
        style={{ background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)' }}
      >
        <ClipboardList size={40} className="text-indigo-400" strokeWidth={1.5} />
      </div>

      <h3 className="text-xl font-bold text-slate-800">
        {hasFilters ? 'No matching tasks' : 'No tasks yet'}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-slate-500 leading-relaxed">
        {hasFilters
          ? 'Try adjusting your filters or search term to find what you are looking for.'
          : 'Get started by creating your first task. Stay organised and ship faster!'}
      </p>

      <div className="mt-6 flex gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5
              text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <X size={15} /> Clear Filters
          </button>
        )}
        <button
          type="button"
          onClick={onAddTask}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md
            transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          <Plus size={16} strokeWidth={2.5} /> Add Task
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  // ── Data state ──
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [statsLoad, setStatsLoad] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ── Filter state ──
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  // ─── Data fetching ────────────────────────────────────────────────────────

  const loadStats = useCallback(async () => {
    setStatsLoad(true)
    try {
      const data = await taskService.getStatistics()
      setStats({
        total: data.total ?? 0,
        pending: data.pending ?? 0,
        in_progress: data.in_progress ?? 0,
        completed: data.completed ?? 0,
      })
    } catch {
      // Non-critical — silently fail
    } finally {
      setStatsLoad(false)
    }
  }, [])

  const loadTasks = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)

    try {
      const data = await taskService.getTasks()
      setTasks(Array.isArray(data?.tasks) ? data.tasks : Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error(err?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const refresh = useCallback(async (showRefreshing = true) => {
    await Promise.all([loadTasks(showRefreshing), loadStats()])
  }, [loadTasks, loadStats])

  useEffect(() => {
    refresh(false)
  }, [])

  // ─── Client-side filtering ────────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    const term = filters.search.toLowerCase().trim()
    return tasks.filter((t) => {
      if (filters.status && t.status !== filters.status) return false
      if (filters.priority && t.priority !== filters.priority) return false
      if (term && !t.title?.toLowerCase().includes(term) &&
        !t.description?.toLowerCase().includes(term)) return false
      return true
    })
  }, [tasks, filters])

  const hasFilters =
    filters.status !== '' || filters.priority !== '' || filters.search !== ''

  const setFilter = (key) => (value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const clearFilters = () => setFilters(EMPTY_FILTERS)

  // ─── Modal handlers ───────────────────────────────────────────────────────

  const openCreate = () => { setSelectedTask(null); setModalOpen(true) }
  const openEdit = (task) => { setSelectedTask(task); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setSelectedTask(null) }

  const handleSave = useCallback(async (formData) => {
    if (formData.id) {
      await taskService.updateTask(formData.id, formData)
    } else {
      await taskService.createTask(formData)
    }
    await refresh(false)
  }, [refresh])

  const handleDelete = useCallback(async (id) => {
    try {
      await taskService.deleteTask(id)
      toast.success('Task deleted.')
      await refresh(false)
    } catch (err) {
      toast.error(err?.message || 'Failed to delete task')
    }
  }, [refresh])

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <section className="animate-fade-in min-h-full">

      {/* ── Page header ── */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>
            {refreshing && (
              <Loader2 size={18} className="animate-spin text-indigo-500" aria-label="Refreshing…" />
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back,{' '}
            <span className="font-semibold text-indigo-600">{user?.name ?? 'there'}</span>
            ! Here's what's on your plate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            type="button"
            onClick={() => refresh(true)}
            disabled={refreshing || loading}
            aria-label="Refresh tasks"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500
              transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
              disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {/* Add task */}
          <button
            id="add-task-btn"
            type="button"
            onClick={openCreate}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5
              text-sm font-semibold text-white shadow-md transition-all duration-300
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow: '0 4px 14px -2px rgba(99,102,241,0.45)',
            }}
          >
            <span
              className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent
                transition-transform duration-700 group-hover:translate-x-[100%]"
              aria-hidden
            />
            <Plus size={17} strokeWidth={2.5} />
            Add Task
          </button>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={statsLoad ? '—' : stats.total}
          icon={ListTodo}
          color="indigo"
          loading={statsLoad}
        />
        <StatsCard
          title="Pending"
          value={statsLoad ? '—' : stats.pending}
          icon={Clock}
          color="yellow"
          loading={statsLoad}
          trend={stats.total
            ? { value: `${Math.round((stats.pending / stats.total) * 100)}%`, isPositive: false }
            : undefined}
        />
        <StatsCard
          title="In Progress"
          value={statsLoad ? '—' : stats.in_progress}
          icon={Zap}
          color="blue"
          loading={statsLoad}
          trend={stats.total
            ? { value: `${Math.round((stats.in_progress / stats.total) * 100)}%`, isPositive: true }
            : undefined}
        />
        <StatsCard
          title="Completed"
          value={statsLoad ? '—' : stats.completed}
          icon={CheckCircle2}
          color="green"
          loading={statsLoad}
          trend={stats.total
            ? { value: `${Math.round((stats.completed / stats.total) * 100)}%`, isPositive: true }
            : undefined}
        />
      </div>

      {/* ── Filters + search ── */}
      <div
        className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="flex flex-col gap-4">
          {/* Row 1: search + clear */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="task-search"
                type="search"
                placeholder="Search tasks by title or description…"
                value={filters.search}
                onChange={(e) => setFilter('search')(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900
                  placeholder-slate-400 outline-none transition-all duration-200
                  focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setFilter('search')('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-3.5 py-2.5
                  text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <X size={14} /> Clear all
              </button>
            )}
          </div>

          {/* Row 2: filter pills */}
          <div className="flex flex-wrap items-center gap-y-2">
            <div className="flex items-center gap-1.5 mr-4">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                Status
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <FilterPill
                  key={f.value}
                  label={f.label}
                  color={f.color}
                  active={filters.status === f.value}
                  onClick={() => setFilter('status')(f.value)}
                />
              ))}
            </div>

            <div className="mx-4 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />

            <div className="flex items-center gap-1.5 mr-4 mt-2 sm:mt-0">
              <Filter size={13} className="text-slate-400" />
              <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                Priority
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {PRIORITY_FILTERS.map((f) => (
                <FilterPill
                  key={f.value}
                  label={f.label}
                  color={f.color}
                  active={filters.priority === f.value}
                  onClick={() => setFilter('priority')(f.value)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && tasks.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700">{filteredTasks.length}</span>
            {hasFilters && (
              <> of <span className="font-semibold text-slate-700">{tasks.length}</span></>
            )}{' '}
            task{filteredTasks.length !== 1 ? 's' : ''}
          </p>

          {isAdmin && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}
            >
              <CheckSquare size={11} /> Admin mode
            </span>
          )}
        </div>
      )}

      {/* ── Task grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)
          : filteredTasks.length === 0
            ? (
              <EmptyState
                hasFilters={hasFilters}
                onClearFilters={clearFilters}
                onAddTask={openCreate}
              />
            )
            : filteredTasks.map((task) => (
              <div key={task.id} className="animate-fade-in">
                <TaskCard
                  task={task}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  isAdmin={isAdmin}
                />
              </div>
            ))
        }
      </div>

      {/* ── Task modal ── */}
      <TaskModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        task={selectedTask}
      />
    </section>
  )
}
