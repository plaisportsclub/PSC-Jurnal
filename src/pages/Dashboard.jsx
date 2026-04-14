import { useMemo } from 'react'
import { TrendingUp, Receipt, DollarSign, Wallet, AlertTriangle, Package } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, Label, Mono, Badge, Empty } from '../components/Card'
import { HealthGauge } from '../components/HealthGauge'
import { fR, fS, cp } from '../utils/format'
import { CH_COLORS, CH_LABELS, OPEX } from '../utils/constants'

const TTS = { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

export function Dashboard({ D, raw }) {
  const target = D.budgetTarget || 50000000
  const grossProfit = (D.revMtd || 0) - (D.cogsMtd || 0)
  const netProfit = grossProfit - (D.opexMtd || 0)
  const netMargin = D.revMtd > 0 ? (netProfit / D.revMtd) * 100 : 0
  const expRatio = D.revMtd > 0 ? ((D.expMtd || 0) / D.revMtd) * 100 : 0
  const revPct = (D.revMtd || 0) / target

  const dom = new Date().getDate()
  const dim = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const expPct = dom / dim

  // Health score
  let hs = 100
  if (netMargin < 0) hs -= 40
  else if (netMargin < 10) hs -= 20
  else if (netMargin < 20) hs -= 10
  if (revPct < 0.3) hs -= 20
  else if (revPct < 0.5) hs -= 15
  else if (revPct < 0.7) hs -= 5
  if (expRatio > 50) hs -= 15
  else if (expRatio > 40) hs -= 10
  if ((D.flagCount || 0) > 10) hs -= 10
  else if ((D.flagCount || 0) > 5) hs -= 5
  if (D.revMtd > 0 && (D.invValue || 0) > 3 * D.revMtd) hs -= 10
  hs = Math.max(0, Math.min(100, hs))

  const revDelta = D.revYesterday > 0 ? ((D.revToday - D.revYesterday) / D.revYesterday) * 100 : null

  return (
    <>
      {/* Health + Revenue Target */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-3.5 mb-3.5">
        <Card className="flex flex-col items-center">
          <Label>Health Score</Label>
          <HealthGauge score={hs} />
        </Card>
        <Card>
          <div className="flex justify-between mb-2">
            <Label>Revenue vs Target MTD</Label>
            <span className="font-mono text-xs text-slate-500">Target: {fR(target)}</span>
          </div>
          <Mono size="text-[26px]">{fR(D.revMtd)}</Mono>
          <div className="relative h-2.5 bg-slate-100 rounded-md overflow-hidden my-2.5">
            <div
              className="absolute left-0 top-0 bottom-0 rounded-md transition-all duration-700"
              style={{
                width: `${Math.min(revPct * 100, 100)}%`,
                background: revPct >= expPct
                  ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                  : 'linear-gradient(90deg,#eab308,#f59e0b)',
              }}
            />
            <div
              className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-slate-400 opacity-40"
              style={{ left: `${expPct * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{(revPct * 100).toFixed(1)}%</span>
            <span>Day {dom}/{dim}</span>
          </div>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3.5">
        <Card>
          <div className="flex items-center gap-1.5 mb-1"><TrendingUp size={13} className="text-slate-500" /><Label>Revenue Hari Ini</Label></div>
          <Mono size="text-lg">{fR(D.revToday)}</Mono>
          {revDelta != null && (
            <div className={`text-[11px] mt-1 ${revDelta < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {revDelta > 0 ? '+' : ''}{revDelta.toFixed(1)}%
            </div>
          )}
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 mb-1"><Receipt size={13} className="text-slate-500" /><Label>Expense Hari Ini</Label></div>
          <Mono size="text-lg" color={D.expToday > 0 ? 'text-red-600' : 'text-slate-900'}>{fR(D.expToday)}</Mono>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 mb-1"><DollarSign size={13} className="text-slate-500" /><Label>Net Profit MTD</Label></div>
          <Mono size="text-lg" color={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{fR(netProfit)}</Mono>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5 mb-1"><Wallet size={13} className="text-slate-500" /><Label>Cash (est.)</Label></div>
          <Mono size="text-lg">{fR(D.cashBalance || 0)}</Mono>
        </Card>
      </div>

      {/* Direct / Marketplace / Pending */}
      <div className="grid grid-cols-3 gap-3 mb-3.5">
        <Card><Badge text="Direct" color="#059669" /><Mono size="text-lg" className="mt-1.5">{fR(D.directTotal)}</Mono></Card>
        <Card><Badge text="Marketplace" color="#d97706" /><Mono size="text-lg" className="mt-1.5">{fR(D.mktTotal)}</Mono></Card>
        <Card className="!bg-amber-50 !border-amber-200">
          <Label>Pending</Label>
          <Mono size="text-lg" color="text-amber-800" className="mt-1.5">{fR(D.pendingSettlement)}</Mono>
        </Card>
      </div>

      {/* Channel Donut + Trend */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-3.5 mb-3.5">
        <Card>
          <Label>Channel</Label>
          {D.channels?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={D.channels} dataKey="total" nameKey="channel" cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2} strokeWidth={0}>
                    {D.channels.map((c) => <Cell key={c.channel} fill={CH_COLORS[c.channel] || '#94a3b8'} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5">
                {D.channels.map((c) => (
                  <div key={c.channel} className="flex justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: CH_COLORS[c.channel] }} />
                      {CH_LABELS[c.channel] || c.channel}
                    </div>
                    <span className="font-mono font-medium">{fS(c.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <Empty />}
        </Card>
        <Card>
          <Label>Trend 30 Hari</Label>
          {D.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={D.trend} margin={{ top: 14, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${new Date(v).getDate()}/${new Date(v).getMonth() + 1}`} interval={Math.floor(D.trend.length / 8)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} width={46} />
                <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
                <Bar dataKey="total" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>
      </div>

      {/* P&L summary + Flags + Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <Label>P&L MTD</Label>
          <div className="mt-2.5 font-mono">
            {[
              { l: 'Revenue', v: D.revMtd, b: true },
              { l: 'COGS', v: -(D.cogsMtd || 0) },
              { l: 'Gross', v: grossProfit, b: true, ln: true },
              { l: 'Opex', v: -(D.opexMtd || 0) },
              { l: 'Net', v: netProfit, b: true, ln: true },
            ].map((r, i) => (
              <div key={i}>
                {r.ln && <div className="border-t border-slate-200 my-1" />}
                <div className={`flex justify-between py-0.5 text-xs ${r.b ? 'font-semibold' : 'font-normal'}`}>
                  <span className="font-sans text-slate-600">{r.l}</span>
                  <span className={r.v < 0 ? 'text-red-600' : 'text-slate-900'}>{fS(Math.abs(r.v))}</span>
                </div>
              </div>
            ))}
            <div className="border-t border-slate-200 my-1" />
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Margin</span>
              <span className={`font-semibold ${netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-500" />
            <Label>Flags</Label>
          </div>
          <Mono size="text-[32px]" color="text-amber-600" className="mt-1.5">{D.flagCount || 0}</Mono>
        </Card>
        <Card>
          <div className="flex items-center gap-1.5">
            <Package size={13} className="text-slate-500" />
            <Label>Inventory</Label>
          </div>
          <Mono size="text-lg" className="mt-1.5">{fR(D.invValue)}</Mono>
          <div className="flex flex-col gap-0.5 mt-1.5 text-[10px] text-slate-400">
            <div className="flex justify-between"><span>Barang Jadi</span><span className="font-mono">{fS(D.invFG || 0)}</span></div>
            <div className="flex justify-between"><span>Bahan Baku</span><span className="font-mono">{fS(D.invRM || 0)}</span></div>
          </div>
        </Card>
      </div>
    </>
  )
}
