const variants = {
  primary: 'bg-slate-900 text-white border-transparent',
  secondary: 'bg-white text-slate-700 border-slate-200',
  danger: 'bg-red-50 text-red-600 border-red-200',
  success: 'bg-green-50 text-green-600 border-green-200',
}

export function Button({ children, onClick, variant = 'primary', disabled, small, className = '', style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 border rounded-lg font-semibold font-sans cursor-pointer
        ${small ? 'px-2.5 py-1 text-[11px]' : 'px-4 py-2 text-[13px]'}
        ${variants[variant] || variants.primary}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
      style={style}
    >
      {children}
    </button>
  )
}
