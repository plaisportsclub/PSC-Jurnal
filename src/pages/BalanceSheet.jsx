import { Card, Label, Badge } from '../components/Card'
import { fR } from '../utils/format'

function Row({ l, v, b }) {
  return (
    <div className={`flex justify-between px-3 ${b ? 'py-2.5 border-b-2 border-slate-300 font-bold text-sm' : 'py-2 border-b border-slate-100 text-[13px]'}`}>
      <span>{l}</span>
      <span className={`font-mono ${v < 0 ? 'text-red-600' : 'text-slate-900'}`}>{fR(v)}</span>
    </div>
  )
}

export function BalanceSheet({ D, raw }) {
  const cash = D.cashBalance || 0
  const ar = D.ar || 0
  const inv = D.invValue || 0
  const fa = D.fixedAssets || 0
  const totalAssets = cash + ar + inv + fa

  const retainedEarnings =
    raw.incomes.reduce((s, i) => s + Number(i.amount), 0) -
    raw.expenses.reduce((s, e) => s + Number(e.amount), 0) -
    raw.journals.filter((j) => ['COGS', 'PRODUCTION'].includes(j.journal_type)).reduce((s, j) => s + Number(j.amount), 0)

  return (
    <Card>
      <div className="flex justify-between mb-3.5">
        <Label>Balance Sheet</Label>
        <Badge text="Estimasi" color="#d97706" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs font-bold py-2 border-b-2 border-slate-900 uppercase">Assets</div>
          <Row l="Cash & Bank" v={cash} />
          <Row l="AR (Pending)" v={ar} />
          <Row l="Inventory" v={inv} />
          <Row l="Fixed Assets" v={fa} />
          <Row l="TOTAL" v={totalAssets} b />
        </div>
        <div>
          <div className="text-xs font-bold py-2 border-b-2 border-slate-900 uppercase">Equity</div>
          <Row l="Retained Earnings" v={retainedEarnings} />
          <Row l="TOTAL" v={retainedEarnings} b />
        </div>
      </div>
    </Card>
  )
}
