import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { Card, Label, Badge } from '../components/Card'
import { Button } from '../components/Button'
import { DateFilter } from '../components/Input'
import { DataTable } from '../components/DataTable'
import { fR, fD, td } from '../utils/format'
import { exportCSV } from '../utils/csv'

const TYPE_COLORS = {
  OPENING: '#16a34a',
  COGS: '#dc2626',
  PRODUCTION: '#f59e0b',
  RESTOCK: '#0ea5e9',
  PURCHASE: '#6366f1',
  PURCHASE_DP: '#8b5cf6',
  PURCHASE_PELUNASAN: '#7c3aed',
  PURCHASE_RM: '#a855f7',
  EXPENSE: '#d97706',
  income: '#059669',
  expense: '#d97706',
  revenue: '#059669',
  sale: '#059669',
  discount: '#ef4444',
  shipping: '#06b6d4',
  shipping_income: '#06b6d4',
  purchase_dp: '#8b5cf6',
  purchase_pelunasan: '#7c3aed',
  purchase: '#6366f1',
  settlement_income: '#059669',
  settlement_fee: '#ef4444',
  refund: '#ef4444',
}

const TYPE_GROUPS = [
  { label: 'Inventory & Production', types: ['PRODUCTION', 'COGS', 'RESTOCK'] },
  { label: 'Purchases', types: ['PURCHASE', 'PURCHASE_DP', 'PURCHASE_PELUNASAN', 'PURCHASE_RM', 'purchase', 'purchase_dp', 'purchase_pelunasan'] },
  { label: 'Revenue & Income', types: ['income', 'revenue', 'sale', 'shipping', 'shipping_income', 'settlement_income'] },
  { label: 'Expenses', types: ['EXPENSE', 'expense', 'discount', 'settlement_fee', 'refund'] },
  { label: 'Opening', types: ['OPENING'] },
]

function getTypeColor(t) {
  return TYPE_COLORS[t] || '#94a3b8'
}

export function Journal({ raw }) {
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState(td())
  const [typeFilter, setTypeFilter] = useState('ALL')

  const types = useMemo(() => [...new Set(raw.journals.map((j) => j.journal_type))].sort(), [raw.journals])

  const typeCounts = useMemo(() => {
    const counts = {}
    raw.journals.filter((j) => j.date >= dateFrom && j.date <= dateTo).forEach((j) => {
      counts[j.journal_type] = (counts[j.journal_type] || 0) + 1
    })
    return counts
  }, [raw.journals, dateFrom, dateTo])

  const filtered = useMemo(
    () => raw.journals.filter((j) => j.date >= dateFrom && j.date <= dateTo && (typeFilter === 'ALL' || j.journal_type === typeFilter)),
    [raw.journals, dateFrom, dateTo, typeFilter]
  )

  const totalDebit = filtered.reduce((s, j) => s + (j.debit_account ? Number(j.amount) : 0), 0)
  const totalCredit = filtered.reduce((s, j) => s + (j.credit_account ? Number(j.amount) : 0), 0)

  return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <DateFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-[7px] bg-white text-slate-700"
          >
            <option value="ALL">ALL ({Object.values(typeCounts).reduce((s, c) => s + c, 0)})</option>
            {TYPE_GROUPS.map((g) => {
              const groupTypes = g.types.filter((t) => types.includes(t))
              if (groupTypes.length === 0) return null
              return (
                <optgroup key={g.label} label={g.label}>
                  {groupTypes.map((t) => (
                    <option key={t} value={t}>{t} ({typeCounts[t] || 0})</option>
                  ))}
                </optgroup>
              )
            })}
            {/* Types not in any group */}
            {types.filter((t) => !TYPE_GROUPS.some((g) => g.types.includes(t))).map((t) => (
              <option key={t} value={t}>{t} ({typeCounts[t] || 0})</option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => exportCSV(filtered.map((j) => ({ date: j.date, type: j.journal_type, ref: j.reference, debit: j.debit_account, credit: j.credit_account, amount: j.amount, desc: j.description, period: j.period_label })), 'psc-journal.csv')}
          variant="secondary"
          small
        >
          <Download size={13} />CSV
        </Button>
      </div>

      {/* Type summary pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={() => setTypeFilter('ALL')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${typeFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
        >
          ALL
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? 'ALL' : t)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors"
            style={typeFilter === t
              ? { background: getTypeColor(t), color: '#fff', borderColor: getTypeColor(t) }
              : { background: '#fff', color: getTypeColor(t), borderColor: getTypeColor(t) + '40' }
            }
          >
            {t} <span className="opacity-70">{typeCounts[t] || 0}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex justify-between items-center">
          <Label>Journal ({filtered.length})</Label>
          <div className="text-[10px] text-slate-400 font-mono">
            Dr {fR(totalDebit)} · Cr {fR(totalCredit)}
          </div>
        </div>
        <div className="mt-3">
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (v) => fD(v), nowrap: true },
              { key: 'journal_type', label: 'Type', render: (v) => <Badge text={v} color={getTypeColor(v)} /> },
              { key: 'reference', label: 'Ref' },
              { key: 'debit_account', label: 'Dr', nowrap: true },
              { key: 'credit_account', label: 'Cr', nowrap: true },
              { key: 'amount', label: 'Amount', align: 'right', mono: true, render: (v) => fR(v) },
              { key: 'description', label: 'Desc', maxW: 220 },
              { key: 'tags', label: 'Tags', render: (v) => v ? <span className="text-[10px] text-slate-400">{v}</span> : null, maxW: 120 },
            ]}
            data={filtered}
            pageSize={20}
          />
        </div>
      </Card>
    </>
  )
}
