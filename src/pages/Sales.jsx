import { useState, useMemo } from 'react'
import { Download, Plus } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts'
import { Card, Label, Mono, Badge, Empty } from '../components/Card'
import { Button } from '../components/Button'
import { DateFilter } from '../components/Input'
import { DataTable } from '../components/DataTable'
import { IncomeForm } from '../forms/IncomeForm'
import { fR, fS, fD, td, normCh } from '../utils/format'
import { CH_COLORS, CH_LABELS, isRevProduct, isRevAny } from '../utils/constants'
import { exportCSV } from '../utils/csv'

const TTS = { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

export function Sales({ raw, onSaved }) {
  const [showForm, setShowForm] = useState(false)
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().split('T')[0] })
  const [dateTo, setDateTo] = useState(td())

  const filtered = useMemo(() => raw.incomes.filter((i) => i.date >= dateFrom && i.date <= dateTo), [raw.incomes, dateFrom, dateTo])

  const byChannel = useMemo(() => {
    const m = {}
    filtered.filter((i) => isRevProduct(i.revenue_account_code)).forEach((i) => {
      const ch = normCh(i.channel)
      if (!m[ch]) m[ch] = { channel: ch, total: 0, count: 0, amounts: [] }
      m[ch].total += Number(i.amount); m[ch].count++; m[ch].amounts.push(Number(i.amount))
    })
    return Object.values(m).map((c) => ({ ...c, aov: Math.round(c.total / c.count) })).sort((a, b) => b.total - a.total)
  }, [filtered])

  const monthlyByChannel = useMemo(() => {
    const m = {}
    filtered.filter((i) => isRevAny(i.revenue_account_code)).forEach((i) => {
      const mo = i.date?.slice(0, 7); const ch = normCh(i.channel)
      if (!mo) return
      if (!m[mo]) m[mo] = { month: mo }
      if (!m[mo][ch]) m[mo][ch] = 0
      m[mo][ch] += Number(i.amount)
    })
    return Object.values(m).sort((a, b) => a.month.localeCompare(b.month))
  }, [filtered])

  const topCustomers = useMemo(() => {
    const m = {}
    filtered.filter((i) => isRevProduct(i.revenue_account_code) && i.customer).forEach((i) => {
      const c = i.customer
      if (!m[c]) m[c] = { name: c, total: 0, count: 0 }
      m[c].total += Number(i.amount); m[c].count++
    })
    return Object.values(m).sort((a, b) => b.total - a.total).slice(0, 8)
  }, [filtered])

  const activeChannels = useMemo(
    () => [...new Set(filtered.filter((i) => isRevAny(i.revenue_account_code)).map((i) => normCh(i.channel)))],
    [filtered]
  )

  const handleSaved = () => { setShowForm(false); onSaved() }
  const revFiltered = filtered.filter((i) => isRevAny(i.revenue_account_code))

  return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <DateFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
        <div className="flex gap-1.5">
          <Button onClick={() => exportCSV(filtered.map((i) => ({ date: i.date, channel: normCh(i.channel), description: i.description, amount: i.amount, customer: i.customer, type: isRevProduct(i.revenue_account_code) ? 'product' : 'shipping', pending: i.pending_settlement })), 'psc-sales.csv')} variant="secondary" small><Download size={13} />CSV</Button>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'} small><Plus size={14} />Input</Button>
        </div>
      </div>

      {showForm && <div className="mb-3.5"><IncomeForm coa={raw.coa} onSaved={handleSaved} onCancel={() => setShowForm(false)} /></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3.5">
        <Card><Label>Revenue</Label><Mono size="text-lg" color="text-green-600" className="mt-1">{fR(revFiltered.reduce((s, i) => s + Number(i.amount), 0))}</Mono></Card>
        <Card><Label>Products</Label><Mono size="text-lg" className="mt-1">{fR(filtered.filter((i) => isRevProduct(i.revenue_account_code)).reduce((s, i) => s + Number(i.amount), 0))}</Mono></Card>
        <Card><Label>Shipping</Label><Mono size="text-lg" className="mt-1">{fR(filtered.filter((i) => i.revenue_account_code === '7-70099').reduce((s, i) => s + Number(i.amount), 0))}</Mono></Card>
        <Card><Label>Orders</Label><Mono size="text-lg" className="mt-1">{filtered.filter((i) => isRevProduct(i.revenue_account_code)).length}</Mono></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
        <Card>
          <Label>By Channel</Label>
          {byChannel.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(160, byChannel.length * 38)}>
              <BarChart data={byChannel} layout="vertical" margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="channel" width={100} tickFormatter={(v) => CH_LABELS[v] || v} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {byChannel.map((c) => <Cell key={c.channel} fill={CH_COLORS[c.channel] || '#94a3b8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>
        <Card>
          <Label>AOV per Channel</Label>
          {byChannel.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={Math.max(120, byChannel.length * 36)}>
                <BarChart data={byChannel} layout="vertical" margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="channel" width={100} tickFormatter={(v) => CH_LABELS[v] || v} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
                  <Bar dataKey="aov" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
              <div className={`grid grid-cols-${Math.min(byChannel.length, 3)} gap-1.5 mt-1.5`}>
                {byChannel.map((c) => (
                  <div key={c.channel} className="bg-slate-50 rounded-md p-1.5">
                    <div className="text-[10px] text-slate-500">{CH_LABELS[c.channel]}</div>
                    <div className="font-mono text-xs font-semibold">{fR(c.aov)}</div>
                    <div className="text-[10px] text-slate-400">{c.count} orders</div>
                  </div>
                ))}
              </div>
            </>
          ) : <Empty />}
        </Card>
      </div>

      <Card className="mb-3.5">
        <Label>Monthly by Channel</Label>
        {monthlyByChannel.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyByChannel} margin={{ top: 14, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} width={46} />
              <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => CH_LABELS[v] || v} />
              {activeChannels.map((ch, idx) => (
                <Bar key={ch} dataKey={ch} stackId="rev" fill={CH_COLORS[ch] || '#94a3b8'} maxBarSize={40} radius={idx === activeChannels.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty />}
      </Card>

      <Card className="mb-3.5">
        <Label>Top Customers</Label>
        {topCustomers.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(140, topCustomers.length * 26)}>
            <BarChart data={topCustomers} layout="vertical" margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
              <Bar dataKey="total" fill="#22c55e" radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty />}
      </Card>

      <Card>
        <Label>All Sales</Label>
        <div className="mt-3">
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (v) => fD(v), nowrap: true },
              { key: 'channel', label: 'Ch', render: (v) => { const n = normCh(v); return <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: CH_COLORS[n] || '#94a3b8' }} />{CH_LABELS[n] || n}</span> } },
              { key: 'description', label: 'Desc', maxW: 260 },
              { key: 'amount', label: 'Amount', align: 'right', mono: true, render: (v) => fR(v) },
              { key: 'customer', label: 'Customer' },
              { key: 'revenue_account_code', label: 'Type', render: (v) => isRevProduct(v) ? 'Product' : 'Ship', nowrap: true },
              { key: 'pending_settlement', label: 'Status', render: (v) => v ? <Badge text="Pending" color="#d97706" /> : null, align: 'center' },
            ]}
            data={filtered}
          />
        </div>
      </Card>
    </>
  )
}
