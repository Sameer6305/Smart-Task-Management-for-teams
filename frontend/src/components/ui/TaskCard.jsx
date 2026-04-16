import { useState, useCallback } from 'react'
import {
  Pencil,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Circle,
  Flag,
  MoreVertical,
  X,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Config maps
// ─────────────────────────────────────────────────────────────────────────────

const PRIORITY_MAP = {
  high: {
    border:   '#ef4444',              // red-500
    label:    'High',
    bg:       'rgba(239,68,68,0.08)',
    text:     '#ef4444',
    icon:     { color: '#ef4444' },
    dot:      '#ef4444',
  },
  medium: {
    border:   '#f59e0b',              // amber-500
    label:    'Medium',
    bg:       'rgba(245,158,11,0.08)',
    text:     '#f59e0b',
    icon:     { color: '#f59e0b' },
    dot:      '#f59e0b',
  },
  low: {
    border:   '#10b981',              // emerald-500
    label:    'Low',
    bg:       'rgba(16,185,129,0.08)',
    text:     '#10b981',
    icon:     { color: '#10b981' },
    dot:      '#10b981',
  },
}

const STATUS_MAP = {
  pending: {
    label:  'Pending',
    fg:     '#64748b',
    bg:     'rgba(100,116,139,0.10)',
    Icon:   Circle,
  },
  in_progress: {
    label:  'In Progress',
    fg:     '#3b82f6',
    bg:     'rgba(59,130,246,0.10)',
    Icon:   CircleDot,
  },
  completed: {
    label:  'Completed',
    fg:     '#10b981',
    bg:     'rgba(16,185,129,0.10)',
    Icon:   CheckCircle2,
  },
}

const DEFAULT_PRIORITY = PRIORITY_MAP.medium
const DEFAULT_STATUS   = STATUS_MAP.pending

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Return true when `date` is strictly before today (midnight). */
function isOverdue(date) {
  if (!date) return false
  const due   = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

/** Format a date string as "15 Apr 2025". */
function fmtDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

/** Clamp description to `maxLen` chars. */
function truncate(text, maxLen = 100) {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? DEFAULT_STATUS
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: s.fg, background: s.bg }}
    >
      <s.Icon size={11} strokeWidth={2.5} />
      {s.label}
    </span>
  )
}

function PriorityBadge({ priority }) {
  const p = PRIORITY_MAP[priority] ?? DEFAULT_PRIORITY
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color: p.text, background: p.bg }}
    >
      <Flag size={10} strokeWidth={2.5} />
      {p.label}
    </span>
  )
}

function DateRow({ icon: Icon, label, date, overdue = false }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon
        size={13}
        className="flex-shrink-0"
        style={{ color: overdue ? '#ef4444' : '#94a3b8' }}
      />
      <span className="text-slate-400">{label}:</span>
      <span
        className="font-medium"
        style={{ color: overdue ? '#ef4444' : '#475569' }}
      >
        {fmtDate(date)}
        {overdue && (
          <span className="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-red-500">
            <AlertCircle size={11} strokeWidth={2.5} />
            Overdue
          </span>
        )}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm-delete dialog
// ─────────────────────────────────────────────────────────────────────────────
function DeleteDialog({ title, onConfirm, onCancel }) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      {/* Panel — stop propagation so backdrop click doesn't bubble inside */}
      <div
        className="animate-scale-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(239,68,68,0.10)' }}
          >
            <Trash2 size={20} className="text-red-500" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="mt-0.5 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <h2
          id="delete-dialog-title"
          className="mt-4 text-base font-bold text-slate-900"
        >
          Delete task?
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">"{title}"</span> will be
          permanently removed. This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium
              text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white
              shadow-sm transition-all hover:opacity-90 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            style={{ background: 'linear-gradient(135deg,#f87171,#ef4444)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TaskCard
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{
 *   task:     { id, title, description, status, priority, dueDate, createdAt },
 *   onEdit:   (task: object) => void,
 *   onDelete: (id: string|number) => void,
 *   isAdmin:  boolean,
 * }} props
 */
export default function TaskCard({ task, onEdit, onDelete, isAdmin = false }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hovered,       setHovered]       = useState(false)

  const priority = PRIORITY_MAP[task?.priority] ?? DEFAULT_PRIORITY
  const overdue  = isOverdue(task?.dueDate)

  const handleEdit = useCallback(() => onEdit?.(task), [onEdit, task])

  const handleDeleteConfirm = useCallback(() => {
    setConfirmDelete(false)
    onDelete?.(task?.id)
  }, [onDelete, task?.id])

  if (!task) return null

  return (
    <>
      <article
        className="group relative flex overflow-hidden rounded-2xl border border-slate-100 bg-white
          transition-all duration-300 ease-out
          hover:-translate-y-1"
        style={{
          boxShadow: hovered
            ? `0 12px 32px -6px rgba(0,0,0,0.10), 0 4px 12px -2px rgba(0,0,0,0.06), inset 3px 0 0 ${priority.border}`
            : `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), inset 3px 0 0 ${priority.border}`,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Task: ${task.title}`}
      >
        {/* ── Priority left border glow (decorative) ── */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(to bottom, transparent, ${priority.border}, transparent)`,
          }}
          aria-hidden
        />

        {/* ── Card body ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">

          {/* ── Top row: badges + action buttons ── */}
          <div className="flex items-start justify-between gap-3">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge   status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Action buttons */}
            <div
              className="flex flex-shrink-0 items-center gap-1 transition-opacity duration-200"
              style={{ opacity: hovered ? 1 : 0.4 }}
            >
              {/* Edit */}
              <button
                type="button"
                id={`task-edit-${task.id}`}
                onClick={handleEdit}
                aria-label={`Edit task: ${task.title}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400
                  transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-600
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <Pencil size={15} strokeWidth={2} />
              </button>

              {/* Delete — admin only */}
              {isAdmin && (
                <button
                  type="button"
                  id={`task-delete-${task.id}`}
                  onClick={() => setConfirmDelete(true)}
                  aria-label={`Delete task: ${task.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400
                    transition-all duration-150 hover:bg-red-50 hover:text-red-500
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* ── Title ── */}
          <div>
            <h3
              className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900
                transition-colors duration-200 group-hover:text-indigo-700"
              title={task.title}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {truncate(task.description, 100)}
              </p>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="h-px bg-slate-100" aria-hidden />

          {/* ── Date rows ── */}
          <div className="flex flex-col gap-1.5">
            {task.dueDate && (
              <DateRow
                icon={Calendar}
                label="Due"
                date={task.dueDate}
                overdue={overdue}
              />
            )}
            {task.createdAt && (
              <DateRow
                icon={Clock}
                label="Created"
                date={task.createdAt}
              />
            )}
          </div>
        </div>

        {/* ── Completed overlay strip ── */}
        {task.status === 'completed' && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.03]"
            style={{ background: 'linear-gradient(135deg, #10b981, transparent)' }}
            aria-hidden
          />
        )}
      </article>

      {/* ── Delete confirmation dialog ── */}
      {confirmDelete && (
        <DeleteDialog
          title={task.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
