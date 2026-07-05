import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { Card, Label, Mono } from '../components/Card'
import { fR, fS } from '../utils/format'

const TTS = { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

export function Cashflow({ D }) {
  // Bulanan dari buku besar (v_cash_flow: mutasi akun kas 1-10001/1-10002-2/1-10003)
  const monthly = (D.cashFlow || []).filter((r) => r.period_label >= '2026-01')
  const mChart = monthly.map((r) => ({
    period: r.period_label,
    masuk: Number(r.kas_masuk),
    keluar: Number(r.kas_keluar),
    net: Number(r.net_cash_flow),
  }))

  // Harian 30d dari incomes/expenses (operasional)
  const cf = D.cfTrend || []
  let run = 0
  const cfBalance = cf.map((d) => {
    run += d.in - d.out
    return { ...d, balance: run }
  })

  const totalIn = cf.reduce((s, d) => s + d.in, 0)
  const totalOut = cf.reduce((s, d) => s + d.out, 0)

  return (
    <>
      <Card className="mb-3.5">
        <div className="flex justify-between items-center">
          <Label>Arus Kas Bulanan (buku besar — semua akun kas)</Label>
          <span className="text-[10px] text-slate-400">sumber: v_cash_flow</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mChart} margin={{ top: 14, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} width={50} />
            <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="masuk" name="Masuk" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={22} />
            <Bar dataKey="keluar" name="Keluar" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase border-b-2 border-slate-200">Periode</th>
                <th className="px-3 py-2 text-right font-semibold text-[11px] border-b-2 border-slate-200">Masuk</th>
                <th className="px-3 py-2 text-right font-semibold text-[11px] border-b-2 border-slate-200">Keluar</th>
                <th className="px-3 py-2 text-right font-semibold text-[11px] border-b-2 border-slate-200">Net</th>
              </tr>
            </thead>
            <tbody>
              {[...mChart].reverse().map((r) => (
                <tr key={r.period} className="border-b border-slate-100">
                  <td className="px-3 py-1.5 font-mono">{r.period}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-green-600">{fR(r.masuk)}</td>
                  <td className="px-3 py-1.5 text-right font-mono text-red-600">{fR(r.keluar)}</td>
                  <td className={`px-3 py-1.5 text-right font-mono font-bold ${r.net < 0 ? 'text-red-600' : 'text-slate-900'}`}>{fR(r.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-3.5">
        <Card><Label>In (30d)</Label><Mono size="text-lg" color="text-green-600" className="mt-1.5">{fR(totalIn)}</Mono></Card>
        <Card><Label>Out (30d)</Label><Mono size="text-lg" color="text-red-600" className="mt-1.5">{fR(totalOut)}</Mono></Card>
        <Card><Label>Net (30d)</Label><Mono size="text-lg" className="mt-1.5">{fR(totalIn - totalOut)}</Mono></Card>
      </div>

      <Card className="mb-3.5">
        <Label>Daily Cash Flow (30d, dari incomes/expenses)</Label>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={cf} margin={{ top: 14, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${new Date(v).getDate()}/${new Date(v).getMonth() + 1}`} interval={Math.floor(cf.length / 8)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} width={46} />
            <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="in" name="In" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={14} />
            <Bar dataKey="out" name="Out" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <Label>Running Balance (30d)</Label>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={cfBalance} margin={{ top: 14, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${new Date(v).getDate()}/${new Date(v).getMonth() + 1}`} interval={Math.floor(cfBalance.length / 8)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Mono',monospace" }} tickFormatter={fS} axisLine={false} tickLine={false} width={50} />
            <Tooltip formatter={(v) => fR(v)} contentStyle={TTS} />
            <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </>
  )
}
