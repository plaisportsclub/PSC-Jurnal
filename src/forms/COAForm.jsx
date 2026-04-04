import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Card, Label } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { sbPost, sbPatch } from '../lib/supabase'
import { TYPE_OPTS, CAT_OPTS } from '../utils/constants'

export function COAForm({ initial, onSaved, onCancel }) {
  const isEdit = !!initial
  const [f, setF] = useState(
    initial || { account_code: '', account_name: '', account_type: 'expense', category: 'ga' }
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async () => {
    if (!f.account_code || !f.account_name) {
      setErr('Code & name wajib')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      if (isEdit) {
        await sbPatch('chart_of_accounts', `account_code=eq.${initial.account_code}`, {
          account_name: f.account_name,
          account_type: f.account_type,
          category: f.category || null,
        })
      } else {
        await sbPost('chart_of_accounts', {
          account_code: f.account_code,
          account_name: f.account_name,
          account_type: f.account_type,
          category: f.category || null,
          is_active: true,
        })
      }
      onSaved()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="!border-2 !border-blue-500 mb-3.5">
      <div className="flex justify-between mb-3">
        <Label>{isEdit ? 'Edit' : 'Add'} COA</Label>
        <button onClick={onCancel} className="bg-transparent border-none cursor-pointer">
          <X size={16} className="text-slate-400" />
        </button>
      </div>
      {err && (
        <div className="bg-red-50 px-3 py-2 rounded-md text-xs text-red-600 mb-2.5">{err}</div>
      )}
      <div className="grid grid-cols-4 gap-2.5 mb-3">
        <Input label="Code" value={f.account_code} onChange={(v) => setF({ ...f, account_code: v })} required disabled={isEdit} />
        <Input label="Name" value={f.account_name} onChange={(v) => setF({ ...f, account_name: v })} required />
        <Input label="Type" value={f.account_type} onChange={(v) => setF({ ...f, account_type: v })} options={TYPE_OPTS} />
        <Input label="Category" value={f.category} onChange={(v) => setF({ ...f, category: v })} options={CAT_OPTS} />
      </div>
      <Button onClick={submit} disabled={saving}>
        <Save size={14} />
        {saving ? '...' : isEdit ? 'Update' : 'Tambah'}
      </Button>
    </Card>
  )
}
