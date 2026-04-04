import { useState, useEffect, useMemo } from 'react'
import { Search, X, ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'

export function DataTable({ columns, data, pageSize = 15 }) {
  const [pg, setPg] = useState(0)
  const [sc, setSc] = useState(null)
  const [sd, setSd] = useState('desc')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    if (!q) return data
    const s = q.toLowerCase()
    return data.filter((r) =>
      columns.some((c) => String(r[c.key] || '').toLowerCase().includes(s))
    )
  }, [data, q, columns])

  const sorted = useMemo(() => {
    if (!sc) return filtered
    return [...filtered].sort((a, b) => {
      const va = a[sc] ?? ''
      const vb = b[sc] ?? ''
      const na = Number(va)
      const nb = Number(vb)
      if (!isNaN(na) && !isNaN(nb)) return sd === 'asc' ? na - nb : nb - na
      return sd === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
  }, [filtered, sc, sd])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const pageData = sorted.slice(pg * pageSize, (pg + 1) * pageSize)

  useEffect(() => { setPg(0) }, [q, data])

  const handleSort = (key, sortable) => {
    if (sortable === false) return
    if (sc === key) setSd((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSc(key); setSd('desc') }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="relative flex-1 max-w-[300px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari..."
            className="w-full py-1.5 pl-8 pr-8 rounded-lg border border-slate-200 text-xs outline-none"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
            >
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>
        <span className="text-[11px] text-slate-400">{filtered.length}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key, c.sortable)}
                  className={`px-2.5 py-2 font-semibold text-slate-600 text-[10px] uppercase border-b border-slate-200 whitespace-nowrap select-none ${
                    c.sortable !== false ? 'cursor-pointer' : ''
                  } ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sc === c.key && (sd === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-7 text-center text-slate-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              pageData.map((r, i) => (
                <tr key={r.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-2.5 py-2 text-slate-700 ${
                        c.mono ? 'font-mono' : ''
                      } ${c.nowrap ? 'whitespace-nowrap' : ''} ${
                        c.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                      style={{ maxWidth: c.maxW || 'auto', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {c.render ? c.render(r[c.key], r) : r[c.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2.5">
          <PgBtn disabled={pg === 0} onClick={() => setPg(0)} icon={ChevronsLeft} />
          <PgBtn disabled={pg === 0} onClick={() => setPg((p) => p - 1)} icon={ChevronLeft} />
          <span className="text-[11px] text-slate-500 px-1.5">{pg + 1}/{totalPages}</span>
          <PgBtn disabled={pg >= totalPages - 1} onClick={() => setPg((p) => p + 1)} icon={ChevronRight} />
          <PgBtn disabled={pg >= totalPages - 1} onClick={() => setPg(totalPages - 1)} icon={ChevronsRight} />
        </div>
      )}
    </div>
  )
}

function PgBtn({ disabled, onClick, icon: Icon }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="p-1 px-1.5 rounded-md border border-slate-200 bg-white cursor-pointer flex disabled:opacity-40"
    >
      <Icon size={13} />
    </button>
  )
}
