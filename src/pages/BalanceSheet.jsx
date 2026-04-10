import { useMemo } from 'react'
import { Card, Label, Badge } from '../components/Card'
import { fR } from '../utils/format'

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

export function BalanceSheet({ raw }) {
  const bs = useMemo(() => {
    const { journals, incomes, expenses, inventory, rawMaterials } = raw

    // --- Opening balances from journal_entries (OPENING type) ---
    // debit_account entries = positive (assets, debit-normal)
    // credit_account entries = negative (liabilities, equity, contra-assets)
    const ob = {}
    journals
      .filter((j) => j.journal_type === 'OPENING')
      .forEach((j) => {
        if (j.debit_account) ob[j.debit_account] = (ob[j.debit_account] || 0) + Number(j.amount)
        if (j.credit_account) ob[j.credit_account] = (ob[j.credit_account] || 0) - Number(j.amount)
      })

    // China trip EXPENSE journals: debit expense accts, credit 3-31001
    journals
      .filter((j) => j.journal_type === 'EXPENSE')
      .forEach((j) => {
        if (j.credit_account) ob[j.credit_account] = (ob[j.credit_account] || 0) - Number(j.amount)
      })

    // --- ASSETS ---
    // Cash = Opening BCA + income received - expenses paid - purchase payments
    const cashOpening = ob['1-10002-2'] || 0
    const incomeReceived = incomes
      .filter((i) => !i.pending_settlement)
      .reduce((s, i) => s + Number(i.amount), 0)
    const expensesPaid = expenses.reduce((s, e) => s + Number(e.amount), 0)
    const cash = cashOpening + incomeReceived - expensesPaid

    // AR = pending settlement incomes (marketplace belum cair)
    const ar = incomes
      .filter((i) => i.pending_settlement)
      .reduce((s, i) => s + Number(i.amount), 0)

    // Inventory Barang Jadi = live dari tabel inventory (stok x HPP)
    const invFG = inventory.reduce((s, i) => s + Number(i.stok) * Number(i.hpp), 0)

    // Inventory Bahan Baku = live dari tabel raw_materials (stok_qty x hpp_per_unit)
    const invRM = (rawMaterials || []).reduce((s, r) => s + Number(r.stok_qty || 0) * Number(r.hpp_per_unit || 0), 0)

    // Uang Muka
    const uangMuka = ob['1-10402'] || 0

    // Fixed Assets
    const mesin = ob['1-10704'] || 0
    const peralatan = ob['1-10705'] || 0
    const deprMesin = ob['1-10754'] || 0   // negative
    const deprKantor = ob['1-10755'] || 0  // negative
    const faGross = mesin + peralatan
    const faDepr = deprMesin + deprKantor
    const faNet = faGross + faDepr

    const totalAssets = cash + ar + invFG + invRM + uangMuka + faNet

    // --- LIABILITIES ---
    const hutangBella = Math.abs(ob['2-20600-1'] || 0)
    const hutangGaby = Math.abs(ob['2-20600-2'] || 0)
    const totalLiabilities = hutangBella + hutangGaby

    // --- EQUITY ---
    const modalAwal = Math.abs(ob['3-30999'] || 0)

    // Selisih Pembukuan = debit balance in equity (reduces equity)
    // After OPENING + China trip credits, ob['3-31001'] is net positive (debit balance)
    const selisih = ob['3-31001'] || 0

    // Laba berjalan = all income - all expense - COGS/production journals
    const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0)
    const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0)
    const cogs = journals
      .filter((j) => ['COGS', 'PRODUCTION'].includes(j.journal_type))
      .reduce((s, j) => s + Number(j.amount), 0)
    const labaBerjalan = totalIncome - totalExpense - cogs

    const totalEquity = modalAwal - selisih + labaBerjalan
    const totalLE = totalLiabilities + totalEquity

    return {
      cash, ar, invFG, invRM, uangMuka,
      faGross, faDepr, faNet,
      totalAssets,
      hutangBella, hutangGaby, totalLiabilities,
      modalAwal, selisih, labaBerjalan, totalEquity,
      totalLE,
    }
  }, [raw])

  const diff = Math.abs(bs.totalAssets - bs.totalLE)
  const balanced = diff < 100

  return (
    <Card>
      <div className="flex justify-between mb-3.5">
        <Label>Balance Sheet</Label>
        {balanced
          ? <Badge text="Balance" color="#16a34a" />
          : <Badge text={`Selisih ${fR(diff)}`} color="#dc2626" />
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: ASSETS */}
        <div>
          <Section title="Assets" />
          <Row l="Cash & Bank (BCA)" v={bs.cash} />
          <Row l="Piutang (Pending Settlement)" v={bs.ar} />
          <Row l="Inventory Barang Jadi" v={bs.invFG} />
          <Row l="Inventory Bahan Baku" v={bs.invRM} />
          <Row l="Uang Muka" v={bs.uangMuka} />
          <Row l="Aset Tetap (bruto)" v={bs.faGross} sub />
          <Row l="Akum. Penyusutan" v={bs.faDepr} sub />
          <Row l="Aset Tetap (neto)" v={bs.faNet} />
          <Row l="TOTAL ASSETS" v={bs.totalAssets} b />
        </div>

        {/* RIGHT: LIABILITIES + EQUITY */}
        <div>
          <Section title="Liabilities" />
          <Row l="Hutang Bella" v={bs.hutangBella} />
          <Row l="Hutang Gaby" v={bs.hutangGaby} />
          <Row l="TOTAL LIABILITIES" v={bs.totalLiabilities} b />

          <div className="mt-4">
            <Section title="Equity" />
            <Row l="Modal Awal" v={bs.modalAwal} />
            <Row l="Selisih Pembukuan 2025" v={-bs.selisih} />
            <Row l="Laba Berjalan" v={bs.labaBerjalan} />
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
