import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { Card, Label, Badge } from '../components/Card'
import { Button } from '../components/Button'
import { DateFilter } from '../components/Input'
import { DataTable } from '../components/DataTable'
import { fR, fD, td } from '../utils/format'
import { exportCSV } from '../utils/csv'

export function Journal({ raw }) {
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState(td())
  const [typeFilter, setTypeFilter] = useState('ALL')

  const types = useMemo(() => ['ALL', ...new Set(raw.journals.map((j) => j.journal_type))], [raw.journals])

  const filtered = useMemo(() => raw.journals.filter((j) => j.date >= dateFrom && j.date <= dateTo && (typeFilter === 'ALL' || j.journal_type === typeFilter)), [raw.journals, dateFrom, dateTo, typeFilter])

  return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <DateFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2.5 py-[7px] bg-white text-slate-700">
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
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

      <Card>
        <Label>Journal ({filtered.length})</Label>
        <div className="mt-3">
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (v) => fD(v), nowrap: true },
              { key: 'journal_type', label: 'Type', render: (v) => <Badge text={v} color={v === 'COGS' ? '#dc2626' : v === 'OPENING' ? '#16a34a' : v === 'EXPENSE' ? '#d97706' : '#8b5cf6'} /> },
              { key: 'reference', label: 'Ref' },
              { key: 'debit_account', label: 'Dr', nowrap: true },
              { key: 'credit_account', label: 'Cr', nowrap: true },
              { key: 'amount', label: 'Amount', align: 'right', mono: true, render: (v) => fR(v) },
              { key: 'description', label: 'Desc', maxW: 220 },
              { key: 'period_label', label: 'Period', nowrap: true },
            ]}
            data={filtered}
            pageSize={20}
          />
        </div>
      </Card>
    </>
  )
}
