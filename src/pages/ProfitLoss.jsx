import { useState } from 'react'
import { Download } from 'lucide-react'
import { Card, Label, Empty } from '../components/Card'
import { Button } from '../components/Button'
import { fR } from '../utils/format'
import { exportCSV } from '../utils/csv'

// P&L dari v_income_statement (journal-based, cash-basis) — bukan derivasi client-side
export function ProfitLoss({ D }) {
  const [pnlFrom, setPnlFrom] = useState('2026-01')
  const [pnlTo, setPnlTo] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const all = D.incomeStatement || []
  const periods = all
    .filter((r) => r.period_label >= pnlFrom && r.period_label <= pnlTo)
    .sort((a, b) => b.period_label.localeCompare(a.period_label))

  const num = (r, k) => Number(r?.[k] || 0)
  const total = (k) => periods.reduce((s, r) => s + num(r, k), 0)

  const handleExport = () => {
    exportCSV(
      [...periods].reverse().map((r) => ({
        period: r.period_label,
        revenue: num(r, 'revenue_products'),
        shipping_other: num(r, 'shipping_income'),
        discount_returns: -num(r, 'discount_returns'),
        total_revenue: num(r, 'total_revenue'),
        cogs: num(r, 'cogs'),
        gross_profit: num(r, 'gross_profit'),
        opex_marketing: num(r, 'opex_marketing'),
        opex_wages: num(r, 'opex_wages'),
        opex_other: num(r, 'opex_other'),
        total_opex: num(r, 'total_opex'),
        net_profit: num(r, 'net_profit'),
      })),
      'psc-pnl.csv'
    )
  }

  const rows = [
    { l: 'Revenue Products', k: 'revenue_products' },
    { l: 'Other Income (Shipping/Bunga)', k: 'shipping_income' },
    { l: 'Discount & Returns', k: 'discount_returns', neg: true },
    { l: 'Total Revenue', k: 'total_revenue', b: true, ln: true },
    { sp: true },
    { l: 'COGS', k: 'cogs' },
    { l: 'Gross Profit', k: 'gross_profit', b: true, ln: true },
    { l: 'Gross Margin %', pct: true },
    { sp: true },
    { l: 'Marketing (ads/KOL/event/R&D)', k: 'opex_marketing' },
    { l: 'Wages', k: 'opex_wages' },
    { l: 'Other Opex', k: 'opex_other' },
    { l: 'Total Opex', k: 'total_opex', b: true, ln: true },
    { sp: true },
    { l: 'NET PROFIT', k: 'net_profit', b: true, ln: true, big: true },
  ]

  const cellVal = (r, row) => {
    if (row.pct) {
      const tr = num(r, 'total_revenue')
      return tr ? `${((num(r, 'gross_profit') / tr) * 100).toFixed(1)}%` : '-'
    }
    const v = num(r, row.k)
    return fR(row.neg ? -v : v)
  }
  const cellNum = (r, row) => (row.neg ? -num(r, row.k) : num(r, row.k))

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

      {!periods.length ? (
        <Empty msg="Tidak ada data untuk periode ini" />
      ) : (
        <Card>
          <div className="flex justify-between items-center">
            <Label>P&L (cash-basis, dari buku besar)</Label>
            <span className="text-[10px] text-slate-400">sumber: v_income_statement</span>
          </div>
          <div className="overflow-x-auto mt-3.5">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2.5 text-left font-semibold text-[11px] uppercase border-b-2 border-slate-200">Account</th>
                  {periods.map((r) => (
                    <th key={r.period_label} className="px-3 py-2.5 text-right font-semibold text-[11px] border-b-2 border-slate-200 font-mono">{r.period_label}</th>
                  ))}
                  {periods.length > 1 && (
                    <th className="px-3 py-2.5 text-right font-semibold text-[11px] border-b-2 border-slate-200 font-mono bg-slate-100">Total</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  if (row.sp) return <tr key={i}><td colSpan={periods.length + 2} className="h-1.5" /></tr>
                  const totalV = row.pct
                    ? (total('total_revenue') ? `${((total('gross_profit') / total('total_revenue')) * 100).toFixed(1)}%` : '-')
                    : fR(row.neg ? -total(row.k) : total(row.k))
                  return (
                    <tr key={i} className={row.ln ? 'border-t border-slate-300' : ''}>
                      <td className={`px-3 py-1.5 ${row.b ? 'font-bold' : ''} ${row.big ? 'text-sm' : 'text-[13px]'} ${row.pct ? 'text-slate-400 italic' : ''}`}>{row.l}</td>
                      {periods.map((r) => (
                        <td key={r.period_label} className={`px-3 py-1.5 text-right font-mono ${row.b ? 'font-bold' : ''} ${row.big ? 'text-sm' : 'text-[13px]'} ${row.pct ? 'text-slate-400' : cellNum(r, row) < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                          {cellVal(r, row)}
                        </td>
                      ))}
                      {periods.length > 1 && (
                        <td className={`px-3 py-1.5 text-right font-mono bg-slate-50 ${row.b ? 'font-bold' : ''} ${row.big ? 'text-sm' : 'text-[13px]'} ${row.pct ? 'text-slate-400' : ''}`}>
                          {totalV}
                        </td>
                      )}
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
