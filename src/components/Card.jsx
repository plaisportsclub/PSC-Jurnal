export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 px-5 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function Label({ children, className = '' }) {
  return (
    <span className={`text-[11px] text-slate-500 uppercase tracking-wider font-medium ${className}`}>
      {children}
    </span>
  )
}

export function Mono({ children, size = 'text-[22px]', color = 'text-slate-900', className = '' }) {
  return (
    <div className={`font-mono ${size} font-bold leading-tight ${color} ${className}`}>
      {children}
    </div>
  )
}

export function Badge({ text, color = '#3b82f6' }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-xl text-[10px] font-semibold"
      style={{ background: color + '18', color }}
    >
      {text}
    </span>
  )
}

export function Empty({ msg }) {
  return (
    <div className="py-12 px-5 text-center text-slate-400 text-[13px]">
      {msg || 'Belum ada data'}
    </div>
  )
}
