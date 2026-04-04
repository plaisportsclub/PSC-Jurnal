import { useState } from 'react'
import { Plus, Copy, Edit2 } from 'lucide-react'
import { Card, Label, Badge, Empty } from '../components/Card'
import { Button } from '../components/Button'
import { BudgetForm } from '../forms/BudgetForm'
import { sbPost } from '../lib/supabase'
import { fR, cp } from '../utils/format'

export function Budget({ D, raw, fetchAll, onSaved }) {
  const [budgetForm, setBudgetForm] = useState(null)

  const handleCopyPrev = async () => {
    const cm = cp()
    const [y, m] = cm.split('-').map(Number)
    const pm = `${m === 1 ? y - 1 : y}-${String(m === 1 ? 12 : m - 1).padStart(2, '0')}`
    const pb = raw.budgets.filter((b) => b.period_label === pm)
    if (!pb.length) { alert(`No budget in ${pm}`); return }
    for (const b of pb) {
      await sbPost('budgets', {
        period_label: cm,
        account_code: b.account_code,
        budget_type: b.budget_type,
        amount: b.amount,
        notes: `From ${pm}`,
      }).catch(() => {})
    }
    fetchAll()
  }

  const handleSaved = () => { setBudgetForm(null); onSaved() }

  return (
    <>
      <div className="flex justify-between mb-3 flex-wrap gap-2">
        <Label>Budget</Label>
        <div className="flex gap-1.5">
          <Button onClick={handleCopyPrev} variant="secondary" small><Copy size={13} />Copy Prev</Button>
          <Button onClick={() => setBudgetForm({})} small><Plus size={14} />Add</Button>
        </div>
      </div>

      {budgetForm !== null && (
        <BudgetForm coa={raw.coa} initial={budgetForm.id ? budgetForm : null} onSaved={handleSaved} onCancel={() => setBudgetForm(null)} />
      )}

      <Card>
        {raw.budgets.length === 0 ? (
          <Empty msg="No budget" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50">
                  {['Period', 'Account', 'Type', 'Budget', 'Actual', 'Achieved', 'Notes', ''].map((h) => (
                    <th key={h} className={`px-2.5 py-2 font-semibold text-slate-600 text-[10px] uppercase border-b-2 border-slate-200 ${['Budget', 'Actual', 'Achieved'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {raw.budgets.map((b) => {
                  const pnl = D.pnlByMonth?.[b.period_label]
                  const actual = pnl ? pnl.rev + pnl.ship : 0
                  const pA = b.amount > 0 ? (actual / b.amount) * 100 : 0
                  return (
                    <tr key={b.id} className="border-b border-slate-100">
                      <td className="px-2.5 py-2 font-mono font-medium">{b.period_label}</td>
                      <td className="px-2.5 py-2">{raw.coa.find((c) => c.account_code === b.account_code)?.account_name || b.account_code}</td>
                      <td className="px-2.5 py-2"><Badge text={b.budget_type} color="#16a34a" /></td>
                      <td className="px-2.5 py-2 text-right font-mono">{fR(b.amount)}</td>
                      <td className="px-2.5 py-2 text-right font-mono">{fR(actual)}</td>
                      <td className={`px-2.5 py-2 text-right font-mono font-semibold ${pA >= 100 ? 'text-green-600' : pA >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {pA.toFixed(1)}%
                      </td>
                      <td className="px-2.5 py-2 text-slate-500 text-xs">{b.notes || '-'}</td>
                      <td className="px-2.5 py-2">
                        <button onClick={() => setBudgetForm({ ...b, amount: String(b.amount) })} className="bg-transparent border-none cursor-pointer">
                          <Edit2 size={13} className="text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
