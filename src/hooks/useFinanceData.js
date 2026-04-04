import { useState, useEffect, useCallback } from 'react'
import { sbGet } from '../lib/supabase'
import { normCh, td, ms, yd, d30, cp } from '../utils/format'
import { OPEX, SELLING, GA } from '../utils/constants'

export function useFinanceData() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [D, setD] = useState({})
  const [raw, setRaw] = useState({
    incomes: [], expenses: [], journals: [], purchases: [],
    flags: [], inventory: [], coa: [], budgets: [],
  })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const [incomes, expenses, journals, purchases, flags, inventory, coa, budgets] =
        await Promise.all([
          sbGet('incomes', 'select=*&order=date.desc'),
          sbGet('expenses', 'select=*&order=date.desc'),
          sbGet('journal_entries', 'select=*&order=date.desc'),
          sbGet('purchases', 'select=*&order=date.desc'),
          sbGet('agent_flags', 'select=*&resolved_at=is.null'),
          sbGet('inventory', 'select=*&discontinued=eq.false&stok=gt.0'),
          sbGet('chart_of_accounts', 'select=*&order=account_code'),
          sbGet('budgets', 'select=*&order=period_label'),
        ])

      setRaw({ incomes, expenses, journals, purchases, flags, inventory, coa, budgets })

      const m = ms(), t = td(), y = yd(), d3 = d30()
      const revInc = incomes.filter((i) => ['4-40000', '7-70099'].includes(i.revenue_account_code))

      // Revenue
      const revMtd = revInc.filter((i) => i.date >= m).reduce((s, i) => s + Number(i.amount), 0)
      const revToday = revInc.filter((i) => i.date === t).reduce((s, i) => s + Number(i.amount), 0)
      const revYesterday = revInc.filter((i) => i.date === y).reduce((s, i) => s + Number(i.amount), 0)

      // Expenses
      const expMtd = expenses.filter((e) => e.date >= m).reduce((s, e) => s + Number(e.amount), 0)
      const expToday = expenses.filter((e) => e.date === t).reduce((s, e) => s + Number(e.amount), 0)
      const expYesterday = expenses.filter((e) => e.date === y).reduce((s, e) => s + Number(e.amount), 0)

      // COGS MTD
      const cogsMtd =
        journals.filter((j) => j.date >= m && ['COGS', 'PRODUCTION'].includes(j.journal_type))
          .reduce((s, j) => s + Number(j.amount), 0) +
        expenses.filter((e) => e.date >= m && ['5-50001', '5-50300'].includes(e.account_code))
          .reduce((s, e) => s + Number(e.amount), 0)

      // OPEX MTD
      const opexMtd = expenses
        .filter((e) => e.date >= m && OPEX.includes(e.account_code))
        .reduce((s, e) => s + Number(e.amount), 0)

      // Channel breakdown
      const chMap = {}
      revInc.filter((i) => i.date >= m).forEach((i) => {
        const ch = normCh(i.channel)
        const tp = ['shopee', 'tokopedia'].includes(i.channel) ? 'marketplace' : 'direct'
        if (!chMap[ch]) chMap[ch] = { channel: ch, total: 0, type: tp, count: 0 }
        chMap[ch].total += Number(i.amount)
        chMap[ch].count++
      })
      const channels = Object.values(chMap).sort((a, b) => b.total - a.total)
      const directTotal = channels.filter((c) => c.type === 'direct').reduce((s, c) => s + c.total, 0)
      const mktTotal = channels.filter((c) => c.type === 'marketplace').reduce((s, c) => s + c.total, 0)

      // 30-day trend
      const trendMap = {}
      revInc.filter((i) => i.date >= d3).forEach((i) => {
        trendMap[i.date] = (trendMap[i.date] || 0) + Number(i.amount)
      })
      const trend = []
      const cur = new Date(d3), end = new Date(t)
      while (cur <= end) {
        const ds = cur.toISOString().split('T')[0]
        trend.push({ date: ds, total: trendMap[ds] || 0 })
        cur.setDate(cur.getDate() + 1)
      }

      // Settlement & inventory
      const pendingSettlement = incomes
        .filter((i) => i.pending_settlement)
        .reduce((s, i) => s + Number(i.amount), 0)
      const invValue = inventory.reduce((s, i) => s + Number(i.stok) * Number(i.hpp), 0)

      // Cashflow trend
      const cfMap = {}
      incomes.filter((i) => !i.pending_settlement && i.date >= d3).forEach((i) => {
        if (!cfMap[i.date]) cfMap[i.date] = { date: i.date, in: 0, out: 0 }
        cfMap[i.date].in += Number(i.amount)
      })
      expenses.filter((e) => e.date >= d3).forEach((e) => {
        if (!cfMap[e.date]) cfMap[e.date] = { date: e.date, in: 0, out: 0 }
        cfMap[e.date].out += Number(e.amount)
      })
      const cfTrend = []
      const cur2 = new Date(d3)
      while (cur2 <= end) {
        const ds = cur2.toISOString().split('T')[0]
        cfTrend.push(cfMap[ds] || { date: ds, in: 0, out: 0 })
        cur2.setDate(cur2.getDate() + 1)
      }

      // Balance sheet estimates
      const cashBalance =
        incomes.filter((i) => !i.pending_settlement).reduce((s, i) => s + Number(i.amount), 0) -
        expenses.reduce((s, e) => s + Number(e.amount), 0)
      const fixedAssets = expenses
        .filter((e) => e.account_code === '1-10705')
        .reduce((s, e) => s + Number(e.amount), 0)

      // P&L by month
      const pnlByMonth = {}
      incomes.forEach((i) => {
        const pl = i.date?.slice(0, 7)
        if (!pl) return
        if (!pnlByMonth[pl]) pnlByMonth[pl] = { rev: 0, ship: 0, cogs: 0, opex: 0, selling: 0, ga: 0 }
        if (i.revenue_account_code === '4-40000') pnlByMonth[pl].rev += Number(i.amount)
        if (i.revenue_account_code === '7-70099') pnlByMonth[pl].ship += Number(i.amount)
      })
      expenses.forEach((e) => {
        const pl = e.date?.slice(0, 7)
        if (!pl) return
        if (!pnlByMonth[pl]) pnlByMonth[pl] = { rev: 0, ship: 0, cogs: 0, opex: 0, selling: 0, ga: 0 }
        if (['5-50001', '5-50300'].includes(e.account_code)) pnlByMonth[pl].cogs += Number(e.amount)
        if (SELLING.includes(e.account_code)) {
          pnlByMonth[pl].selling += Number(e.amount)
          pnlByMonth[pl].opex += Number(e.amount)
        }
        if (GA.includes(e.account_code)) {
          pnlByMonth[pl].ga += Number(e.amount)
          pnlByMonth[pl].opex += Number(e.amount)
        }
      })
      journals.forEach((j) => {
        const pl = j.date?.slice(0, 7)
        if (!pl) return
        if (!pnlByMonth[pl]) pnlByMonth[pl] = { rev: 0, ship: 0, cogs: 0, opex: 0, selling: 0, ga: 0 }
        if (['COGS', 'PRODUCTION'].includes(j.journal_type)) pnlByMonth[pl].cogs += Number(j.amount)
      })

      const budgetTarget = budgets.find(
        (b) => b.period_label === cp() && b.budget_type === 'revenue'
      )?.amount || 50000000

      setD({
        revMtd, revToday, revYesterday,
        expMtd, expToday, expYesterday,
        cogsMtd, opexMtd,
        channels, directTotal, mktTotal,
        trend, pendingSettlement, invValue,
        cfTrend, cashBalance, ar: pendingSettlement, fixedAssets,
        pnlByMonth, flagCount: flags.length, budgetTarget,
      })
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { loading, err, D, raw, fetchAll }
}
