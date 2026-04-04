import { useState, useMemo } from 'react'
import { Check, CheckCircle } from 'lucide-react'
import { Card, Label, Mono, Badge, Empty } from '../components/Card'
import { Button } from '../components/Button'
import { sbPatch } from '../lib/supabase'
import { fR, fD, td, daysBetween, normCh } from '../utils/format'
import { CH_COLORS, CH_LABELS } from '../utils/constants'

export function Settlements({ raw, fetchAll }) {
  const [selected, setSelected] = useState([])

  const pendingTrx = useMemo(() => raw.incomes.filter((i) => i.pending_settlement), [raw.incomes])
  const settledTrx = useMemo(() => raw.incomes.filter((i) => !i.pending_settlement && ['shopee', 'tokopedia'].includes(i.channel)), [raw.incomes])

  const pendingByPlatform = useMemo(() => {
    const m = {}
    pendingTrx.forEach((i) => {
      const p = i.channel
      if (!m[p]) m[p] = { platform: p, total: 0, count: 0, oldest: i.date, newest: i.date }
      m[p].total += Number(i.amount); m[p].count++
      if (i.date < m[p].oldest) m[p].oldest = i.date
      if (i.date > m[p].newest) m[p].newest = i.date
    })
    return Object.values(m)
  }, [pendingTrx])

  const pendingAging = useMemo(() => {
    const today = td()
    return pendingTrx.map((i) => ({
      ...i,
      days: daysBetween(i.date, today),
      platform: i.channel === 'tokopedia' ? 'Tokped/TikTok' : 'Shopee',
    }))
  }, [pendingTrx])

  const mktRevenue = useMemo(() => {
    const m = {}
    raw.incomes.filter((i) => ['shopee', 'tokopedia'].includes(i.channel) && i.revenue_account_code === '4-40000').forEach((i) => {
      const p = i.channel; const mo = i.date?.slice(0, 7)
      const k = `${p}-${mo}`
      if (!m[k]) m[k] = { platform: p, month: mo, revenue: 0, orders: 0, settled: 0, pending: 0 }
      m[k].revenue += Number(i.amount); m[k].orders++
      if (i.pending_settlement) m[k].pending += Number(i.amount)
      else m[k].settled += Number(i.amount)
    })
    return Object.values(m).sort((a, b) => b.month.localeCompare(a.month) || a.platform.localeCompare(b.platform))
  }, [raw.incomes])

  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])

  const markSettled = async (ids) => {
    try {
      for (const id of ids) await sbPatch('incomes', `id=eq.${id}`, { pending_settlement: false })
      setSelected([])
      fetchAll()
    } catch (e) { alert(e.message) }
  }

  return (
    <>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3.5">
        <Card className="!bg-amber-50 !border-amber-200">
          <Label>Total Pending</Label>
          <Mono size="text-[22px]" color="text-amber-800" className="mt-1.5">{fR(pendingTrx.reduce((s, i) => s + Number(i.amount), 0))}</Mono>
          <div className="text-xs text-amber-700 mt-1">{pendingTrx.length} transaksi</div>
        </Card>
        {pendingByPlatform.map((p) => (
          <Card key={p.platform}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: CH_COLORS[p.platform] || '#94a3b8' }} />
              <Label>{CH_LABELS[p.platform] || p.platform}</Label>
            </div>
            <Mono size="text-lg" color="text-amber-800" className="mt-1">{fR(p.total)}</Mono>
            <div className="text-[11px] text-slate-500 mt-1">{p.count} trx &middot; Oldest: {fD(p.oldest)}</div>
            <div className={`text-[11px] mt-0.5 ${daysBetween(p.oldest, td()) > 14 ? 'text-red-600' : 'text-amber-600'}`}>
              {daysBetween(p.oldest, td())} days oldest
            </div>
          </Card>
        ))}
        <Card className="!bg-green-50 !border-green-200">
          <Label>Settled (All Time)</Label>
          <Mono size="text-lg" color="text-green-600" className="mt-1.5">{fR(settledTrx.reduce((s, i) => s + Number(i.amount), 0))}</Mono>
          <div className="text-xs text-green-700 mt-1">{settledTrx.length} transaksi</div>
        </Card>
      </div>

      {/* Aging Table */}
      <Card className="mb-3.5">
        <div className="flex justify-between items-center mb-3">
          <Label>Pending Transactions — Aging</Label>
          {selected.length > 0 && (
            <Button onClick={() => markSettled(selected)} variant="success" small>
              <CheckCircle size={13} />Mark {selected.length} Settled
            </Button>
          )}
        </div>
        {pendingAging.length === 0 ? <Empty msg="Tidak ada pending settlement" /> : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-2.5 py-2 text-center border-b border-slate-200 w-9">
                    <input type="checkbox" checked={selected.length === pendingAging.length && pendingAging.length > 0} onChange={() => selected.length === pendingAging.length ? setSelected([]) : setSelected(pendingAging.map((t) => t.id))} className="cursor-pointer" />
                  </th>
                  {['Date', 'Platform', 'Description', 'Customer', 'Amount', 'Age', ''].map((h) => (
                    <th key={h} className={`px-2.5 py-2 font-semibold text-slate-600 text-[10px] uppercase border-b border-slate-200 ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...pendingAging].sort((a, b) => b.days - a.days).map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2.5 py-2 text-center">
                      <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)} className="cursor-pointer" />
                    </td>
                    <td className="px-2.5 py-2 font-mono text-[11px]">{fD(t.date)}</td>
                    <td className="px-2.5 py-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: CH_COLORS[t.channel] || '#94a3b8' }} />
                        {t.platform}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 max-w-[240px] overflow-hidden text-ellipsis">{t.description}</td>
                    <td className="px-2.5 py-2">{t.customer || '—'}</td>
                    <td className="px-2.5 py-2 text-right font-mono font-semibold">{fR(t.amount)}</td>
                    <td className="px-2.5 py-2 text-center"><Badge text={`${t.days}d`} color={t.days > 14 ? '#dc2626' : t.days > 7 ? '#d97706' : '#059669'} /></td>
                    <td className="px-2.5 py-2">
                      <Button onClick={() => markSettled([t.id])} variant="success" small><Check size={12} />Settled</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Marketplace Revenue Comparison */}
      <Card>
        <Label>Marketplace Revenue by Month</Label>
        {mktRevenue.length > 0 ? (
          <div className="overflow-x-auto mt-3 rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50">
                  {['Month', 'Platform', 'Revenue', 'Orders', 'Settled', 'Pending', '% Settled'].map((h) => (
                    <th key={h} className={`px-2.5 py-2 font-semibold text-slate-600 text-[10px] uppercase border-b border-slate-200 ${['Revenue', 'Orders', 'Settled', 'Pending', '% Settled'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mktRevenue.map((r, i) => {
                  const pctS = r.revenue > 0 ? (r.settled / r.revenue) * 100 : 0
                  return (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-2.5 py-2 font-mono font-medium">{r.month}</td>
                      <td className="px-2.5 py-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: CH_COLORS[r.platform] }} />
                          {CH_LABELS[r.platform]}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono">{fR(r.revenue)}</td>
                      <td className="px-2.5 py-2 text-right">{r.orders}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-green-600">{fR(r.settled)}</td>
                      <td className={`px-2.5 py-2 text-right font-mono ${r.pending > 0 ? 'text-amber-600' : 'text-green-600'}`}>{fR(r.pending)}</td>
                      <td className="px-2.5 py-2 text-right"><Badge text={`${pctS.toFixed(0)}%`} color={pctS >= 100 ? '#16a34a' : pctS >= 50 ? '#d97706' : '#dc2626'} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty />}
      </Card>
    </>
  )
}
