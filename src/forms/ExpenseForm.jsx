import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Card, Label } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { sbPost } from '../lib/supabase'
import { td } from '../utils/format'

export function ExpenseForm({ coa, onSaved, onCancel }) {
  const [f, setF] = useState({ date: td(), account_code: '', description: '', amount: '', recipient: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const expAccounts = coa.filter((c) => ['cogs', 'expense'].includes(c.account_type) || c.account_code === '1-10705')

  const submit = async () => {
    if (!f.date || !f.amount || !f.account_code) {
      setErr('Wajib isi date, COA, amount')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      const ci = coa.find((c) => c.account_code === f.account_code)
      await sbPost('expenses', {
        date: f.date,
        account_code: f.account_code,
        account_name: ci?.account_name || f.account_code,
        description: f.description,
        amount: Number(f.amount),
        recipient: f.recipient || null,
        payment_method: 'transfer',
        from_account_code: '1-10002-2',
        source: 'app',
        verified: false,
      })
      onSaved()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="!border-2 !border-red-500">
      <div className="flex justify-between mb-3.5">
        <Label>Input Expense</Label>
        <button onClick={onCancel} className="bg-transparent border-none cursor-pointer">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
      {err && (
        <div className="bg-red-50 px-3 py-2 rounded-md text-xs text-red-600 mb-2.5">{err}</div>
      )}
      <div className="grid grid-cols-[1fr_2fr] gap-2.5 mb-2.5">
        <Input label="Date" type="date" value={f.date} onChange={(v) => setF({ ...f, date: v })} required />
        <Input
          label="COA"
          value={f.account_code}
          onChange={(v) => setF({ ...f, account_code: v })}
          required
          options={expAccounts.map((c) => ({ value: c.account_code, label: `${c.account_code} - ${c.account_name}` }))}
        />
      </div>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-2.5 mb-3">
        <Input label="Description" value={f.description} onChange={(v) => setF({ ...f, description: v })} />
        <Input label="Amount" type="number" value={f.amount} onChange={(v) => setF({ ...f, amount: v })} required />
        <Input label="Recipient" value={f.recipient} onChange={(v) => setF({ ...f, recipient: v })} />
      </div>
      <Button onClick={submit} disabled={saving} style={{ background: '#dc2626' }}>
        <Save size={14} />
        {saving ? '...' : 'Simpan'}
      </Button>
    </Card>
  )
}
