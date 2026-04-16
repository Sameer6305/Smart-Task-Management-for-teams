import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Color palette map
// Each color gets: gradient for icon bg, ring, soft bg tint, text
// ─────────────────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  indigo: {
    gradient:   'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    ring:       'rgba(99,102,241,0.15)',
    glow:       '0 8px 24px -4px rgba(99,102,241,0.35)',
    tint:       'rgba(99,102,241,0.05)',
    text:       '#6366f1',
    light:      '#eef2ff',
  },
  green: {
    gradient:   'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    ring:       'rgba(16,185,129,0.15)',
    glow:       '0 8px 24px -4px rgba(16,185,129,0.30)',
    tint:       'rgba(16,185,129,0.05)',
    text:       '#10b981',
    light:      '#ecfdf5',
  },
  yellow: {
    gradient:   'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    ring:       'rgba(245,158,11,0.15)',
    glow:       '0 8px 24px -4px rgba(245,158,11,0.30)',
    tint:       'rgba(245,158,11,0.05)',
    text:       '#f59e0b',
    light:      '#fffbeb',
  },
  red: {
    gradient:   'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    ring:       'rgba(239,68,68,0.15)',
    glow:       '0 8px 24px -4px rgba(239,68,68,0.28)',
    tint:       'rgba(239,68,68,0.05)',
    text:       '#ef4444',
    light:      '#fef2f2',
  },
  purple: {
    gradient:   'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    ring:       'rgba(139,92,246,0.15)',
    glow:       '0 8px 24px -4px rgba(139,92,246,0.30)',
    tint:       'rgba(139,92,246,0.05)',
    text:       '#8b5cf6',
    light:      '#f5f3ff',
  },
  blue: {
    gradient:   'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    ring:       'rgba(59,130,246,0.15)',
    glow:       '0 8px 24px -4px rgba(59,130,246,0.28)',
    tint:       'rgba(59,130,246,0.05)',
    text:       '#3b82f6',
    light:      '#eff6ff',
  },
}

const DEFAULT_COLOR = COLOR_MAP.indigo

function resolveColor(color) {
  return COLOR_MAP[color] ?? DEFAULT_COLOR
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend badge
// ─────────────────────────────────────────────────────────────────────────────
function TrendBadge({ trend }) {
  if (!trend) return null

  const { value, isPositive } = trend
  const isNeutral = isPositive === undefined || isPositive === null

  const Icon  = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
  const color = isNeutral
    ? { fg: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
    : isPositive
      ? { fg: '#10b981', bg: 'rgba(16,185,129,0.1)' }
      : { fg: '#ef4444', bg: 'rgba(239,68,68,0.1)' }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: color.fg, background: color.bg }}
      aria-label={`Trend: ${value}`}
    >
      <Icon size={12} strokeWidth={2.5} aria-hidden />
      {value}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated number counter (CSS-only approach via key re-render)
// ─────────────────────────────────────────────────────────────────────────────
function StatValue({ value }) {
  // Format large numbers with commas
  const formatted =
    typeof value === 'number'
      ? value.toLocaleString()
      : String(value ?? '—')

  return (
    <span
      className="animate-fade-in text-3xl font-extrabold tracking-tight text-slate-900"
      key={formatted}
    >
      {formatted}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StatsCard
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{
 *   title:    string,
 *   value:    number | string,
 *   icon:     React.ElementType,
 *   color?:   'indigo'|'green'|'yellow'|'red'|'purple'|'blue',
 *   trend?:   { value: string, isPositive?: boolean },
 *   subtitle?: string,
 *   loading?:  boolean,
 * }} props
 */
export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  trend,
  subtitle,
  loading = false,
}) {
  const c = resolveColor(color)

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div
        className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
        aria-busy="true"
      >
        <div className="flex items-start justify-between">
          <div className="skeleton h-12 w-12 rounded-xl" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-24 rounded-md" />
          <div className="skeleton h-8 w-16 rounded-md" />
        </div>
      </div>
    )
  }

  return (
    <article
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white
        p-6 transition-all duration-300 ease-out
        hover:-translate-y-1 hover:border-slate-200"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = c.glow + ', 0 4px 16px -4px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
      }}
    >
      {/* ── Subtle tinted top-right corner decoration ── */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${c.ring} 0%, transparent 70%)` }}
        aria-hidden
      />

      {/* ── Top row: icon + trend ── */}
      <div className="mb-4 flex items-start justify-between">
        {/* Icon circle */}
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-md
            transition-transform duration-300 group-hover:scale-110"
          style={{
            background: c.gradient,
            boxShadow: `0 4px 12px ${c.ring}`,
          }}
          aria-hidden
        >
          {Icon && <Icon size={22} className="text-white" strokeWidth={2} />}
        </div>

        {/* Trend badge */}
        <TrendBadge trend={trend} />
      </div>

      {/* ── Bottom: title + value ── */}
      <div>
        <p className="mb-1 text-sm font-medium text-slate-500">{title}</p>

        <div className="flex items-end gap-3">
          <StatValue value={value} />

          {subtitle && (
            <span className="mb-1 text-xs font-medium text-slate-400">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* ── Hover bottom accent line ── */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full transition-all duration-500 group-hover:w-full"
        style={{ background: c.gradient }}
        aria-hidden
      />
    </article>
  )
}
