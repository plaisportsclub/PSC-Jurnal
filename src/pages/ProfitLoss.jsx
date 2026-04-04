import { useState } from 'react'
import { Download } from 'lucide-react'
import { Card, Label, Empty } from '../components/Card'
import { Button } from '../components/Button'
import { fR } from '../utils/format'
import { exportCSV } from '../utils/csv'

export function ProfitLoss({ D }) {
  const [pnlFrom, setPnlFrom] = useState('2026-01')
  const [pnlTo, setPnlTo] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const months = Object.keys(D.pnlByMonth || {})
    .filter((m) => m >= pnlFrom && m <= pnlTo)
    .sort()
    .reverse()

  const handleExport = () => {
    exportCSV(
      months.map((m) => {
        const d = D.pnlByMonth[m] || { rev: 0, ship: 0, cogs: 0, opex: 0 }
        return {
          period: m,
          revenue: d.rev,
          shipping: d.ship,
          total_rev: d.rev + d.ship,
          cogs: d.cogs,
          gross: d.rev + d.ship - d.cogs,
          opex: d.opex,
          net: d.rev + d.ship - d.cogs - d.opex,
        }
      }),
      'psc-pnl.csv'
    )
  }

  const rows = [
    { l: 'Revenue Products', k: 'rev' },
    { l: 'Shipping', k: 'ship' },
    { l: 'Total Revenue', calc: (m) => m.rev + m.ship, b: true, ln: true },
    { sp: true },
    { l: 'COGS', k: 'cogs' },
    { l: 'Gross Profit', calc: (m) => m.rev + m.ship - m.cogs, b: true, ln: true },
    { sp: true },
    { l: 'Selling', k: 'selling' },
    { l: 'G&A', k: 'ga' },
    { l: 'Total Opex', k: 'opex', b: true, ln: true },
    { sp: true },
    { l: 'NET PROFIT', calc: (m) => m.rev + m.ship - m.cogs - m.opex, b: true, ln: true, big: true },
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">From:</span>
          <input type="month" value={pnlFrom} onChange={(e) => setPnlFrom(e.target.value)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono" />
          <span className="text-slate-400">&rarr;</span>
          <input type="month" value={pnlTo} onChange={(e) => setPnlTo(e.target.value)} className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono" />
        </div>
        <Button onClick={handleExport} variant="secondary" small>
          <Download size={13} />CSV
        </Button>
      </div>

      {!months.length ? (
        <Empty msg="Tidak ada data untuk periode ini" />
      ) : (
        <Card>
          <Label>P&L</Label>
          <div className="overflow-x-auto mt-3.5">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2.5 text-left font-semibold text-[11px] uppercase border-b-2 border-slate-200">Account</th>
                  {months.map((m) => (
                    <th key={m} className="px-3 py-2.5 text-right font-semibold text-[11px] border-b-2 border-slate-200 font-mono">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  if (r.sp) return <tr key={i}><td colSpan={months.length + 1} className="h-1.5" /></tr>
                  return (
                    <tr key={i} className={r.ln ? 'border-t border-slate-300' : ''}>
                      <td className={`px-3 py-1.5 ${r.b ? 'font-bold' : ''} ${r.big ? 'text-sm' : 'text-[13px]'}`}>{r.l}</td>
                      {months.map((m) => {
                        const d = D.pnlByMonth[m] || { rev: 0, ship: 0, cogs: 0, opex: 0, selling: 0, ga: 0 }
                        const v = r.calc ? r.calc(d) : d[r.k] || 0
                        return (
                          <td key={m} className={`px-3 py-1.5 text-right font-mono ${r.b ? 'font-bold' : ''} ${r.big ? 'text-sm' : 'text-[13px]'} ${v < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            {fR(v)}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
