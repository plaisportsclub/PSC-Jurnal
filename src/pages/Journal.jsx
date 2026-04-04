import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { Card, Label, Badge } from '../components/Card'
import { Button } from '../components/Button'
import { DateFilter } from '../components/Input'
import { DataTable } from '../components/DataTable'
import { fR, fD, td } from '../utils/format'
import { exportCSV } from '../utils/csv'

export function Journal({ raw }) {
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().split('T')[0] })
  const [dateTo, setDateTo] = useState(td())

  const filtered = useMemo(() => raw.journals.filter((j) => j.date >= dateFrom && j.date <= dateTo), [raw.journals, dateFrom, dateTo])

  return (
    <>
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <DateFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
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
              { key: 'journal_type', label: 'Type', render: (v) => <Badge text={v} color={v === 'COGS' ? '#dc2626' : '#8b5cf6'} /> },
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
