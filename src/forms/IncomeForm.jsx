import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Card, Label } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { sbPost } from '../lib/supabase'
import { td } from '../utils/format'
import { CHANNELS, CH_LABELS } from '../utils/constants'

export function IncomeForm({ coa, onSaved, onCancel }) {
  const [f, setF] = useState({
    date: td(),
    channel: 'wa',
    description: '',
    amount: '',
    customer: '',
    revenue_account_code: '4-40000',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async () => {
    if (!f.date || !f.amount || !f.description) {
      setErr('Wajib isi date, description, amount')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      const isMarketplace = ['shopee', 'tokopedia'].includes(f.channel)
      await sbPost('incomes', {
        date: f.date,
        channel: f.channel,
        description: f.description,
        amount: Number(f.amount),
        customer: f.customer || null,
        revenue_account_code: f.revenue_account_code,
        source: 'app',
        source_type: isMarketplace ? 'marketplace' : 'direct',
        payment_method: 'transfer',
        pay_to_account_code: '1-10002-2',
        pending_settlement: isMarketplace,
      })
      onSaved()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const revAccounts = coa.filter((c) => c.account_type === 'income')

  return (
    <Card className="!border-2 !border-blue-500">
      <div className="flex justify-between mb-3.5">
        <Label>Input Income</Label>
        <button onClick={onCancel} className="bg-transparent border-none cursor-pointer">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
      {err && (
        <div className="bg-red-50 px-3 py-2 rounded-md text-xs text-red-600 mb-2.5">{err}</div>
      )}
      <div className="grid grid-cols-3 gap-2.5 mb-2.5">
        <Input label="Date" type="date" value={f.date} onChange={(v) => setF({ ...f, date: v })} required />
        <Input
          label="Channel"
          value={f.channel}
          onChange={(v) => setF({ ...f, channel: v })}
          options={CHANNELS.map((c) => ({ value: c, label: CH_LABELS[c] }))}
        />
        <Input
          label="Rev COA"
          value={f.revenue_account_code}
          onChange={(v) => setF({ ...f, revenue_account_code: v })}
          options={revAccounts.map((c) => ({ value: c.account_code, label: `${c.account_code} - ${c.account_name}` }))}
        />
      </div>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-2.5 mb-3">
        <Input label="Description" value={f.description} onChange={(v) => setF({ ...f, description: v })} required />
        <Input label="Amount" type="number" value={f.amount} onChange={(v) => setF({ ...f, amount: v })} required />
        <Input label="Customer" value={f.customer} onChange={(v) => setF({ ...f, customer: v })} />
      </div>
      <Button onClick={submit} disabled={saving}>
        <Save size={14} />
        {saving ? '...' : 'Simpan'}
      </Button>
    </Card>
  )
}
