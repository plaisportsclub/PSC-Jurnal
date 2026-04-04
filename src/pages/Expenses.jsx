import { useState, useMemo } from 'react'
import { Download, Plus } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Card, Label, Mono, Badge, Empty } from '../components/Card'
import { Button } from '../components/Button'
import { DateFilter } from '../components/Input'
import { DataTable } from '../components/DataTable'
import { ExpenseForm } from '../forms/ExpenseForm'
import { fR, fS, fD, td } from '../utils/format'
import { CAT_COLORS } from '../utils/constants'
import { exportCSV } from '../utils/csv'

const TTS = { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

export function Expenses({ raw, onSaved }) {
  const [showForm, setShowForm] = useState(false)
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().split('T')[0] })
  const [dateTo, setDateTo] = useState(td())

  const filtered = useMemo(() => raw.expenses.filter((e) => e.date >= dateFrom && e.date <= dateTo), [raw.expenses, dateFrom, dateTo])

  const byCategory = useMemo(() => {
    const m = {}
    filtered.forEach((e) => {
      const c = e.account_code
      const n = raw.coa.find((x) => x.account_code === c)?.account_name || e.account_name
      if (!m[c]) m[c] = { code: c, name: n, total: 0 }
      m[c].total += Number(e.amount)
    })
    return Object.values(m).sort((a, b) => b.total - a.total)
  }, [filtered, raw.coa])

  const byRecipient = useMemo(() => {
    const m = {}
    filtered.forEach((e) => {
      const r = e.recipient || 'Unknown'
      if (!m[r]) m[r] = { name: r, total: 0, count: 0 }
      m[r].total += Number(e.amount); m[r].count++
    })
    return Object.values(m).sort((a, b) => b.total - a.total).slice(0, 8)
  }, [filtered])

  const weekly = useMemo(() => {
    const m = {}
    filtered.forEach((e) => {
      const d = new Date(e.date + 'T00:00:00')
      const w = new Date(d); w.setDate(d.getDate() - d.getDay())
      const wk = w.toISOString().split('T')[0]
      if (!m[wk]) m[wk] = { week: wk, total: 0 }
      m[wk].total += Number(e.amount)
    })
    return Object.values(m).sort((a, b) => a.week.localeCompare(b.week))
  }, [filtered])

  const handleSaved = () => { setShowForm(false); onSaved() }

  return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <DateFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
        <div className="flex gap-1.5">
          <Button onClick={() => exportCSV(filtered.map((e) => ({ date: e.date, coa: e.account_code, category: raw.coa.find((c) => c.account_code === e.account_code)?.account_name || e.account_name, description: e.description, amount: e.amount, recipient: e.recipient, source: e.source })), 'psc-expenses.csv')} variant="secondary" small><Download size={13} />CSV</Button>
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'} small><Plus size={14} />Input</Button>
        </div>
      </div>

      {showForm && <div className="mb-3.5"><ExpenseForm coa={raw.coa} onSaved={handleSaved} onCancel={() => setShowForm(false)} /></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3.5">
        <Card><Label>Total</Label><Mono size="text-lg" color="text-red-600" className="mt-1">{fR(filtered.reduce((s, e) => s + Number(e.amount), 0))}</Mono></Card>
        <Card><Label>Avg/trx</Label><Mono size="text-lg" className="mt-1">{fR(filtered.length > 0 ? Math.round(filtered.reduce((s, e) => s + Number(e.amount), 0) / filtered.length) : 0)}</Mono></Card>
        <Card><Label>Categories</Label><Mono size="text-lg" className="mt-1">{byCategory.length}</Mono></Card>
        <Card><Label>Count</Label><Mono size="text-lg" className="mt-1">{filtered.length}</Mono></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
        <Card>
          <Label>By Category</Label>
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, byCategory.length * 30 + 20)}>
              <BarChart data={byCategory} layout="vertical" margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {byCategory.map((c) => <Cell key={c.code} fill={CAT_COLORS[c.code] || '#94a3b8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>
        <Card>
          <Label>Top Recipients</Label>
          {byRecipient.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, byRecipient.length * 30 + 20)}>
              <BarChart data={byRecipient} layout="vertical" margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
                <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>
      </div>

      <Card className="mb-3.5">
        <Label>Weekly Trend</Label>
        {weekly.length > 0 ? (
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={weekly} margin={{ top: 14, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${new Date(v).getDate()}/${new Date(v).getMonth() + 1}`} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} width={46} />
              <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
              <Area type="monotone" dataKey="total" stroke="#ef4444" fill="#ef444420" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <Empty />}
      </Card>

      <Card>
        <Label>All Expenses</Label>
        <div className="mt-3">
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (v) => fD(v), nowrap: true },
              { key: 'account_code', label: 'COA', nowrap: true },
              { key: '_cat', label: 'Category', render: (_, r) => raw.coa.find((x) => x.account_code === r.account_code)?.account_name || r.account_name },
              { key: 'description', label: 'Desc', maxW: 260 },
              { key: 'amount', label: 'Amount', align: 'right', mono: true, render: (v) => fR(v) },
              { key: 'recipient', label: 'Recipient' },
              { key: 'source', label: 'Src', render: (v) => <Badge text={v || 'manual'} color={v === 'agent' ? '#3b82f6' : v === 'app' ? '#059669' : '#64748b'} /> },
            ]}
            data={filtered}
          />
        </div>
      </Card>
    </>
  )
}
