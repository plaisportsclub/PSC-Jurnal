import { Card, Label, Badge, Empty } from '../components/Card'
import { DataTable } from '../components/DataTable'
import { fR, fD } from '../utils/format'

export function Purchases({ raw }) {
  return (
    <Card>
      <Label>Purchases ({raw.purchases.length})</Label>
      <div className="mt-3">
        {raw.purchases.length === 0 ? (
          <Empty />
        ) : (
          <DataTable
            columns={[
              { key: 'date', label: 'Date', render: (v) => fD(v), nowrap: true },
              { key: 'purchase_number', label: 'PO#' },
              { key: 'vendor', label: 'Vendor' },
              { key: 'description', label: 'Desc', maxW: 240 },
              { key: 'total_amount', label: 'Total', align: 'right', mono: true, render: (v) => fR(v) },
              { key: 'status', label: 'Status', render: (v) => <Badge text={v} color={v === 'lunas' ? '#16a34a' : '#3b82f6'} /> },
            ]}
            data={raw.purchases}
          />
        )}
      </div>
    </Card>
  )
}
