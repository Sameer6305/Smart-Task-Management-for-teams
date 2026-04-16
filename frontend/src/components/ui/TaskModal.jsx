import { useState, useEffect, useRef, useCallback, forwardRef } from 'react'
import toast from 'react-hot-toast'
import {
  X,
  Type,
  AlignLeft,
  Calendar,
  Loader2,
  Plus,
  Save,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title:       '',
  description: '',
  status:      'pending',
  priority:    'medium',
  dueDate:     '',
}

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pending',     color: '#64748b' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed',   label: 'Completed',   color: '#10b981' },
]

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low',    color: '#10b981', dot: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', dot: '#f59e0b' },
  { value: 'high',   label: 'High',   color: '#ef4444', dot: '#ef4444' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validate(form) {
  if (!form.title.trim())           return { title: 'Title is required.' }
  if (form.title.trim().length < 3) return { title: 'Title must be at least 3 characters.' }
  if (form.title.length > 120)      return { title: 'Title must be under 120 characters.' }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format ISO / Date obj to yyyy-MM-dd for <input type="date"> */
function toDateInput(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toISOString().split('T')[0]
}

/** Build initial form state from an optional task object. */
function taskToForm(task) {
  if (!task) return EMPTY_FORM
  return {
    title:       task.title       ?? '',
    description: task.description ?? '',
    status:      task.status      ?? 'pending',
    priority:    task.priority    ?? 'medium',
    dueDate:     toDateInput(task.dueDate),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Field wrapper (label + input + optional error)
// ─────────────────────────────────────────────────────────────────────────────

function FieldWrapper({ label, htmlFor, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700"
      >
        {label}
        {required && <span className="text-red-400" aria-hidden>*</span>}
      </label>
      {children}
      {error && (
        <p className="animate-fade-in text-[11px] font-medium text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styled text input
// ─────────────────────────────────────────────────────────────────────────────

const TextInput = forwardRef(function TextInput({ id, icon: Icon, error, ...props }, ref) {
  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={15} />
        </div>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full rounded-xl border bg-slate-50 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none
          transition-all duration-200
          ${Icon ? 'pl-10 pr-4' : 'px-4'}
          ${error
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
            : 'border-slate-200 focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
          }`}
        {...props}
      />
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// Styled textarea
// ─────────────────────────────────────────────────────────────────────────────

function TextArea({ id, icon: Icon, error, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400">
          <Icon size={15} />
        </div>
      )}
      <textarea
        id={id}
        rows={3}
        className={`w-full resize-none rounded-xl border bg-slate-50 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none
          transition-all duration-200
          ${Icon ? 'pl-10 pr-4' : 'px-4'}
          ${error
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
            : 'border-slate-200 focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
          }`}
        {...props}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Segmented picker (Status / Priority)
// ─────────────────────────────────────────────────────────────────────────────

function SegmentedPicker({ id, options, value, onChange }) {
  return (
    <div
      id={id}
      role="radiogroup"
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-semibold
              transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            style={{
              border:     active ? `1.5px solid ${opt.color}` : '1.5px solid #e2e8f0',
              background: active ? `${opt.color}14` : '#f8fafc',
              color:      active ? opt.color : '#64748b',
              boxShadow:  active ? `0 0 0 3px ${opt.color}1a` : 'none',
            }}
          >
            {/* Colour dot */}
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: opt.dot ?? opt.color }}
              aria-hidden
            />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TaskModal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   isOpen:   boolean,
 *   onClose:  () => void,
 *   onSave:   (formData: object) => Promise<void>,
 *   task?:    object,        // undefined → create mode
 * }} props
 */
export default function TaskModal({ isOpen, onClose, onSave, task }) {
  const isEdit = Boolean(task?.id)

  const [form,    setForm]    = useState(() => taskToForm(task))
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  const firstInputRef = useRef(null)

  // ── Sync form when `task` prop changes (switching edit targets) ──
  useEffect(() => {
    if (isOpen) {
      setForm(taskToForm(task))
      setErrors({})
    }
  }, [task, isOpen])

  // ── Animate in / out ──
  useEffect(() => {
    if (isOpen) {
      // Small delay so CSS transition fires after mount
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  // ── Autofocus first input ──
  useEffect(() => {
    if (visible) setTimeout(() => firstInputRef.current?.focus(), 120)
  }, [visible])

  // ── Escape key ──
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  // ── Body scroll lock ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const set = useCallback(
    (field) => (e) => setForm((prev) => ({ ...prev, [field]: e?.target ? e.target.value : e })),
    [],
  )

  const handleClose = useCallback(() => {
    if (loading) return
    setErrors({})
    onClose()
  }, [loading, onClose])

  const handleBackdrop = useCallback(
    (e) => { if (e.target === e.currentTarget) handleClose() },
    [handleClose],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(form)
    if (fieldErrors) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      await onSave({
        ...form,
        title:    form.title.trim(),
        dueDate:  form.dueDate || null,
        ...(isEdit && { id: task.id }),
      })

      toast.success(isEdit ? 'Task updated!' : 'Task created! 🎉', {
        style: {
          background: '#312e81',
          color:      '#fff',
          border:     '1px solid rgba(99,102,241,0.4)',
        },
      })

      handleClose()
    } catch (err) {
      const msg = err?.message || (isEdit ? 'Failed to update task.' : 'Failed to create task.')
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6"
      style={{
        background:    `rgba(15,23,42,${visible ? '0.6' : '0'})`,
        backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        transition:    'background 0.25s ease, backdrop-filter 0.25s ease',
      }}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      {/* ── Panel ── */}
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        style={{
          maxHeight:  '92vh',
          transform:  visible ? 'translateY(0) scale(1)'   : 'translateY(24px) scale(0.97)',
          opacity:    visible ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-6 py-5"
          style={{
            background:   'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {isEdit
                ? <Save       size={18} className="text-white" />
                : <Plus       size={18} className="text-white" strokeWidth={2.5} />}
            </div>
            <div>
              <h2
                id="task-modal-title"
                className="text-base font-bold leading-tight text-white"
              >
                {isEdit ? 'Edit Task' : 'New Task'}
              </h2>
              <p className="text-[11px] text-indigo-200/70">
                {isEdit ? 'Update task details below' : 'Fill in the details to create a new task'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60
              transition-all hover:bg-white/15 hover:text-white focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable form body ── */}
        <form
          id="task-modal-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5"
          noValidate
        >
          <div className="flex flex-col gap-5">

            {/* Title */}
            <FieldWrapper label="Title" htmlFor="task-title" required error={errors.title}>
              <TextInput
                id="task-title"
                ref={firstInputRef}
                icon={Type}
                placeholder="What needs to be done?"
                value={form.title}
                onChange={set('title')}
                maxLength={120}
                error={errors.title}
                autoComplete="off"
              />
              <p className="text-right text-[11px] text-slate-400">
                {form.title.length}/120
              </p>
            </FieldWrapper>

            {/* Description */}
            <FieldWrapper label="Description" htmlFor="task-description">
              <TextArea
                id="task-description"
                icon={AlignLeft}
                placeholder="Add more details… (optional)"
                value={form.description}
                onChange={set('description')}
                maxLength={1000}
              />
            </FieldWrapper>

            {/* Status */}
            <FieldWrapper label="Status" htmlFor="task-status-group">
              <SegmentedPicker
                id="task-status-group"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              />
            </FieldWrapper>

            {/* Priority */}
            <FieldWrapper label="Priority" htmlFor="task-priority-group">
              <SegmentedPicker
                id="task-priority-group"
                options={PRIORITY_OPTIONS}
                value={form.priority}
                onChange={(v) => setForm((p) => ({ ...p, priority: v }))}
              />
            </FieldWrapper>

            {/* Due Date */}
            <FieldWrapper label="Due Date" htmlFor="task-due-date">
              <TextInput
                id="task-due-date"
                type="date"
                icon={Calendar}
                value={form.dueDate}
                onChange={set('dueDate')}
                min={new Date().toISOString().split('T')[0]}
              />
            </FieldWrapper>

            {/* General error */}
            {errors.general && (
              <p
                className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600"
                role="alert"
              >
                {errors.general}
              </p>
            )}
          </div>
        </form>

        {/* ── Sticky footer actions ── */}
        <div
          className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {/* Cancel */}
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700
              transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Save / Update */}
          <button
            type="submit"
            disabled={loading}
            form="task-modal-form"
            onClick={handleSubmit}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5
              text-sm font-semibold text-white shadow-md transition-all duration-300
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background:  loading
                ? 'linear-gradient(135deg,#4338ca,#6d28d9)'
                : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow: '0 4px 14px -2px rgba(99,102,241,0.45)',
            }}
          >
            {/* Shimmer sweep */}
            <span
              className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent
                transition-transform duration-700 group-hover:translate-x-[100%]"
              aria-hidden
            />

            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {isEdit ? 'Updating…' : 'Creating…'}
              </>
            ) : (
              <>
                {isEdit
                  ? <><Save  size={15} /> Update Task</>
                  : <><Plus  size={15} strokeWidth={2.5} /> Create Task</>}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
