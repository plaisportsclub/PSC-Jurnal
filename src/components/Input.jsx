export function Input({ label, value, onChange, type = 'text', placeholder, required, options, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="px-3 py-2 rounded-lg border border-slate-200 text-[13px] bg-white outline-none disabled:bg-slate-50"
        >
          <option value="">Pilih...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg border border-slate-200 text-[13px] outline-none disabled:bg-slate-50 ${
            type === 'number' ? 'font-mono' : ''
          }`}
        />
      )}
    </div>
  )
}

export function DateFilter({ from, to, onFromChange, onToChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] text-slate-500 font-medium">Period:</span>
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono"
      />
      <span className="text-slate-400">&rarr;</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono"
      />
    </div>
  )
}
