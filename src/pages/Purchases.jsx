import { useState } from 'react'
import { Card, Label, Badge, Mono, Empty } from '../components/Card'
import { fR, fD } from '../utils/format'

const STATUS_COLORS = {
  pending: '#94a3b8',
  dp_paid: '#f59e0b',
  paid: '#3b82f6',
  received: '#16a34a',
  cancelled: '#ef4444',
}

const STATUS_LABELS = {
  pending: 'Pending',
  dp_paid: 'DP Paid',
  paid: 'Paid',
  received: 'Received',
  cancelled: 'Cancelled',
}

const DEBIT_LABELS = {
  '1-10200': 'Finished Goods',
  '1-10201': 'Raw Material',
  '1-10402': 'DP Vendor',
  '5-50000': 'Cost of Sales',
  '5-50500': 'Cost of Production',
}

export function Purchases({ raw }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const purchases = raw.purchases || []
  const payments = raw.purchasePayments || []
  const receipts = raw.vendorReceipts || []

  const filtered = filter === 'all'
    ? purchases
    : purchases.filter((p) => p.status === filter)

  const statusCounts = purchases.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const totalByStatus = purchases.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + Number(p.total_amount || 0)
    return acc
  }, {})

  const getPayments = (pid) => payments.filter((pp) => pp.purchase_id === pid)
  const getReceipts = (pid) => receipts.filter((vr) => vr.purchase_id === pid)
  const totalPaid = (pid) => getPayments(pid).reduce((s, pp) => s + Number(pp.amount || 0), 0)

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['pending', 'dp_paid', 'paid', 'received'].map((s) => (
          <Card key={s} className="cursor-pointer hover:ring-1 hover:ring-slate-300" onClick={() => setFilter(filter === s ? 'all' : s)}>
            <Label>{STATUS_LABELS[s]}</Label>
            <Mono size="text-lg" color={filter === s ? 'text-blue-600' : 'text-slate-900'}>
              {statusCounts[s] || 0}
            </Mono>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {fR(totalByStatus[s] || 0)}
            </div>
          </Card>
        ))}
      </div>

      {/* Filter indicator */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <span>Filter:</span>
          <Badge text={STATUS_LABELS[filter]} color={STATUS_COLORS[filter]} />
          <button onClick={() => setFilter('all')} className="text-blue-500 hover:underline text-[11px]">Clear</button>
        </div>
      )}

      {/* Purchase List */}
      <Card>
        <Label>Purchases ({filtered.length})</Label>
        <div className="mt-3 space-y-2">
          {filtered.length === 0 ? (
            <Empty msg={filter !== 'all' ? `Tidak ada purchase dengan status "${filter}"` : undefined} />
          ) : (
            filtered.map((p) => {
              const isExpanded = expanded === p.id
              const pPayments = getPayments(p.id)
              const pReceipts = getReceipts(p.id)
              const paid = totalPaid(p.id)
              const remaining = Number(p.total_amount || 0) - paid
              const color = STATUS_COLORS[p.status] || '#94a3b8'
              const debitLabel = DEBIT_LABELS[p.debit_account] || p.debit_account || '-'

              return (
                <div
                  key={p.id}
                  className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors"
                >
                  {/* Main row */}
                  <div
                    className="px-4 py-3 flex items-start justify-between gap-3 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : p.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[13px] text-slate-900">{p.vendor}</span>
                        <Badge text={STATUS_LABELS[p.status] || p.status} color={color} />
                        <span className="text-[10px] text-slate-400 font-mono">{p.purchase_number}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {fD(p.date)} · {p.description || '-'}
                      </div>
                      <div className="flex gap-3 mt-1 text-[10px]">
                        <span className="text-slate-400">COA: <span className="font-mono text-slate-500">{debitLabel}</span></span>
                        {pPayments.length > 0 && <span className="text-blue-500">{pPayments.length} payment{pPayments.length > 1 ? 's' : ''}</span>}
                        {pReceipts.length > 0 && <span className="text-green-500">{pReceipts.length} receipt{pReceipts.length > 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-[14px] font-bold text-slate-900">{fR(p.total_amount)}</div>
                      {paid > 0 && paid < Number(p.total_amount) && (
                        <div className="text-[10px] text-amber-500 font-mono">
                          Paid {fR(paid)} · Sisa {fR(remaining)}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">{isExpanded ? '▲' : '▼'}</div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-3">
                      {/* Payment History */}
                      <div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment History</div>
                        {pPayments.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic">
                            {p.status === 'pending' ? 'Belum ada pembayaran' : 'Dibayar sebelum sistem payment tracking aktif'}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {pPayments.map((pp) => (
                              <div key={pp.id} className="flex justify-between text-[11px]">
                                <span className="text-slate-600">
                                  {fD(pp.date)} · <Badge text={pp.payment_type || 'payment'} color={pp.payment_type === 'dp' ? '#f59e0b' : '#3b82f6'} />
                                </span>
                                <span className="font-mono text-slate-700 font-medium">{fR(pp.amount)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-[11px] font-semibold border-t border-slate-200 pt-1 mt-1">
                              <span className="text-slate-600">Total Dibayar</span>
                              <span className="font-mono text-slate-900">{fR(paid)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vendor Receipts */}
                      <div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Barang Diterima</div>
                        {pReceipts.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic">
                            {p.status === 'received' ? 'Diterima sebelum sistem receipt tracking aktif' : 'Belum diterima'}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {pReceipts.map((vr) => (
                              <div key={vr.id} className="flex justify-between text-[11px]">
                                <span className="text-slate-600">
                                  {fD(vr.date)} · {vr.receipt_number || '-'} · {vr.target_type === 'raw_material' ? '🧶 Raw Material' : '📦 Finished Goods'}
                                </span>
                                <span className="font-mono text-slate-700">{vr.qty} pcs · {fR(vr.total_amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Journey tracker */}
                      <div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Journey</div>
                        <div className="flex items-center gap-1 text-[10px]">
                          {['pending', 'dp_paid', 'paid', 'received'].map((s, i) => {
                            const reached = ['pending', 'dp_paid', 'paid', 'received'].indexOf(p.status) >= i
                            return (
                              <div key={s} className="flex items-center gap-1">
                                {i > 0 && <div className={`w-6 h-0.5 ${reached ? 'bg-green-400' : 'bg-slate-200'}`} />}
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${reached ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                  {reached ? '✓' : i + 1}
                                </div>
                                <span className={`${reached ? 'text-green-700' : 'text-slate-400'}`}>{STATUS_LABELS[s]}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
