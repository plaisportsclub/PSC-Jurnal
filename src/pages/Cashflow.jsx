import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { Card, Label, Mono } from '../components/Card'
import { fR, fS } from '../utils/format'

const TTS = { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

export function Cashflow({ D }) {
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
      <div className="grid grid-cols-3 gap-3 mb-3.5">
        <Card><Label>In (30d)</Label><Mono size="text-lg" color="text-green-600" className="mt-1.5">{fR(totalIn)}</Mono></Card>
        <Card><Label>Out (30d)</Label><Mono size="text-lg" color="text-red-600" className="mt-1.5">{fR(totalOut)}</Mono></Card>
        <Card><Label>Net (30d)</Label><Mono size="text-lg" className="mt-1.5">{fR(totalIn - totalOut)}</Mono></Card>
      </div>

      <Card className="mb-3.5">
        <Label>Daily Cash Flow</Label>
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
        <Label>Running Balance</Label>
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
