import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Card, Label } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { sbPost, sbPatch } from '../lib/supabase'
import { cp } from '../utils/format'

export function BudgetForm({ coa, onSaved, onCancel, initial }) {
  const isEdit = !!initial
  const [f, setF] = useState(
    initial || { period_label: cp(), account_code: '4-40000', budget_type: 'revenue', amount: '', notes: '' }
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async () => {
    if (!f.period_label || !f.account_code || !f.amount) {
      setErr('Period, account, amount wajib')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      if (isEdit) {
        await sbPatch('budgets', `id=eq.${initial.id}`, {
          amount: Number(f.amount),
          notes: f.notes || null,
        })
      } else {
        await sbPost('budgets', {
          period_label: f.period_label,
          account_code: f.account_code,
          budget_type: f.budget_type,
          amount: Number(f.amount),
          notes: f.notes || null,
        })
      }
      onSaved()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const budgetTypeOpts = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'cogs', label: 'COGS' },
    { value: 'expense', label: 'Expense' },
  ]

  return (
    <Card className="!border-2 !border-blue-500 mb-3.5">
      <div className="flex justify-between mb-3">
        <Label>{isEdit ? 'Edit' : 'Add'} Budget</Label>
        <button onClick={onCancel} className="bg-transparent border-none cursor-pointer">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
      {err && (
        <div className="bg-red-50 px-3 py-2 rounded-md text-xs text-red-600 mb-2.5">{err}</div>
      )}
      <div className="grid grid-cols-5 gap-2.5 mb-3">
        <Input label="Period" value={f.period_label} onChange={(v) => setF({ ...f, period_label: v })} required disabled={isEdit} />
        <Input
          label="Account"
          value={f.account_code}
          onChange={(v) => setF({ ...f, account_code: v })}
          required
          disabled={isEdit}
          options={coa.map((c) => ({ value: c.account_code, label: `${c.account_code} - ${c.account_name}` }))}
        />
        <Input label="Type" value={f.budget_type} onChange={(v) => setF({ ...f, budget_type: v })} disabled={isEdit} options={budgetTypeOpts} />
        <Input label="Amount" type="number" value={f.amount} onChange={(v) => setF({ ...f, amount: v })} required />
        <Input label="Notes" value={f.notes} onChange={(v) => setF({ ...f, notes: v })} />
      </div>
      <Button onClick={submit} disabled={saving}>
        <Save size={14} />
        {saving ? '...' : isEdit ? 'Update' : 'Tambah'}
      </Button>
    </Card>
  )
}
