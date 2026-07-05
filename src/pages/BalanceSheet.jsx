import { useMemo } from 'react'
import { Card, Label, Badge } from '../components/Card'
import { fR } from '../utils/format'

// Neraca dari v_balance_sheet (saldo ledger per akun, sign udah dinormalisasi di view)
function Section({ title }) {
  return <div className="text-xs font-bold py-2 border-b-2 border-slate-900 uppercase">{title}</div>
}

function Row({ l, v, b, sub }) {
  return (
    <div className={`flex justify-between ${sub ? 'pl-5' : 'px-3'} ${b ? 'py-2.5 border-b-2 border-slate-300 font-bold text-sm' : 'py-2 border-b border-slate-100 text-[13px]'}`}>
      <span className={sub ? 'text-slate-500' : ''}>{l}</span>
      <span className={`font-mono ${v < 0 ? 'text-red-600' : 'text-slate-900'}`}>{fR(v)}</span>
    </div>
  )
}

export function BalanceSheet({ D, raw }) {
  const bs = useMemo(() => {
    const rows = D.balanceSheet || []
    const sal = (r) => Number(r.saldo || 0)
    const byType = (t) => rows.filter((r) => r.account_type === t)

    const assets = byType('asset')
    const liabilities = byType('liability')
    const equity = byType('equity')

    const totalAssets = assets.reduce((s, r) => s + sal(r), 0)
    const totalLiabilities = liabilities.reduce((s, r) => s + sal(r), 0)
    const totalEquity3 = equity.reduce((s, r) => s + sal(r), 0)

    // Laba berjalan = income (credit-positive di view) - cogs - expense (debit-positive)
    const labaBerjalan =
      byType('income').reduce((s, r) => s + sal(r), 0) -
      byType('cogs').reduce((s, r) => s + sal(r), 0) -
      byType('expense').reduce((s, r) => s + sal(r), 0)

    const totalEquity = totalEquity3 + labaBerjalan
    const totalLE = totalLiabilities + totalEquity

    // Memo: nilai inventory live (stok fisik x HPP) — pembanding vs saldo ledger
    const invFG = (raw.inventory || []).reduce((s, i) => s + Number(i.stok) * Number(i.hpp), 0)
    const invRM = (raw.rawMaterials || []).reduce((s, r) => s + Number(r.stok_qty || 0) * Number(r.hpp_per_unit || 0), 0)

    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity3, labaBerjalan, totalEquity, totalLE, invFG, invRM }
  }, [D.balanceSheet, raw.inventory, raw.rawMaterials])

  const diff = Math.abs(bs.totalAssets - bs.totalLE)
  const balanced = diff < 100

  return (
    <Card>
      <div className="flex justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Label>Balance Sheet (ledger)</Label>
          <span className="text-[10px] text-slate-400">sumber: v_balance_sheet</span>
        </div>
        {balanced
          ? <Badge text="Balance" color="#16a34a" />
          : <Badge text={`Selisih ${fR(diff)}`} color="#dc2626" />
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: ASSETS */}
        <div>
          <Section title="Assets" />
          {bs.assets.map((r) => (
            <Row key={r.account_code} l={`${r.account_code}  ${r.account_name}`} v={Number(r.saldo)} />
          ))}
          <Row l="TOTAL ASSETS" v={bs.totalAssets} b />
          <div className="mt-3 text-[11px] text-slate-400 leading-relaxed px-3">
            Memo — nilai inventory live (stok × HPP): Barang Jadi {fR(bs.invFG)} + Bahan Baku {fR(bs.invRM)}.
            Saldo ledger inventory belum disesuaikan (menunggu stock opname; konvensi cash membebankan produksi langsung ke HPP).
          </div>
        </div>

        {/* RIGHT: LIABILITIES + EQUITY */}
        <div>
          <Section title="Liabilities" />
          {bs.liabilities.map((r) => (
            <Row key={r.account_code} l={`${r.account_code}  ${r.account_name}`} v={Number(r.saldo)} />
          ))}
          <Row l="TOTAL LIABILITIES" v={bs.totalLiabilities} b />

          <div className="mt-4">
            <Section title="Equity" />
            {bs.equity.map((r) => (
              <Row key={r.account_code} l={`${r.account_code}  ${r.account_name}`} v={Number(r.saldo)} />
            ))}
            <Row l="Laba (Rugi) Berjalan" v={bs.labaBerjalan} />
            <Row l="TOTAL EQUITY" v={bs.totalEquity} b />
          </div>

          <div className="mt-4">
            <Row l="TOTAL LIABILITIES + EQUITY" v={bs.totalLE} b />
          </div>
        </div>
      </div>
    </Card>
  )
}
