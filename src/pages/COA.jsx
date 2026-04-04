import { useState } from 'react'
import { Plus, Edit2, Check, X } from 'lucide-react'
import { Card, Label, Badge } from '../components/Card'
import { Button } from '../components/Button'
import { COAForm } from '../forms/COAForm'
import { sbPatch } from '../lib/supabase'

const TYPE_LABELS = { asset: 'Assets', income: 'Income', cogs: 'COGS', expense: 'Expenses' }
const CAT_LABELS = {
  cash: 'Cash', receivable: 'Receivable', inventory: 'Inventory', fixed_asset: 'Fixed Asset',
  raw_material: 'Raw Material', revenue: 'Revenue', other_income: 'Other Income',
  cost_of_sales: 'Cost of Sales', production: 'Production', selling: 'Selling', ga: 'G&A',
}

export function COA({ raw, fetchAll, onSaved }) {
  const [coaForm, setCoaForm] = useState(null)

  const grouped = { asset: [], income: [], cogs: [], expense: [] }
  raw.coa.forEach((c) => { if (grouped[c.account_type]) grouped[c.account_type].push(c) })

  const handleToggleActive = async (account) => {
    await sbPatch('chart_of_accounts', `account_code=eq.${account.account_code}`, { is_active: !account.is_active })
    fetchAll()
  }

  const handleSaved = () => { setCoaForm(null); onSaved() }

  return (
    <>
      <div className="flex justify-between mb-3">
        <Label>COA ({raw.coa.length})</Label>
        <Button onClick={() => setCoaForm({})} small><Plus size={14} />Add</Button>
      </div>

      {coaForm !== null && (
        <COAForm initial={coaForm.account_code ? coaForm : null} onSaved={handleSaved} onCancel={() => setCoaForm(null)} />
      )}

      <Card>
        {Object.entries(grouped).map(([type, accounts]) =>
          accounts.length > 0 && (
            <div key={type} className="mb-5">
              <div className="text-xs font-bold py-2 border-b-2 border-slate-900 uppercase">
                {TYPE_LABELS[type]} ({accounts.length})
              </div>
              {accounts.map((a) => (
                <div
                  key={a.account_code}
                  className={`flex items-center justify-between px-3 py-2 border-b border-slate-100 text-[13px] ${a.is_active ? '' : 'opacity-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-medium text-blue-500 min-w-[80px]">{a.account_code}</span>
                    <span>{a.account_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge text={CAT_LABELS[a.category] || '-'} color="#64748b" />
                    <button onClick={() => setCoaForm(a)} className="bg-transparent border-none cursor-pointer p-0.5">
                      <Edit2 size={13} className="text-slate-400" />
                    </button>
                    <button onClick={() => handleToggleActive(a)} className="bg-transparent border-none cursor-pointer p-0.5">
                      {a.is_active ? <Check size={13} className="text-green-500" /> : <X size={13} className="text-red-500" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>
    </>
  )
}
