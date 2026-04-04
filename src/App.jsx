import { useState, useMemo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { useFinanceData } from './hooks/useFinanceData'
import { NAV } from './utils/constants'

import { Dashboard } from './pages/Dashboard'
import { ProfitLoss } from './pages/ProfitLoss'
import { BalanceSheet } from './pages/BalanceSheet'
import { Cashflow } from './pages/Cashflow'
import { Expenses } from './pages/Expenses'
import { Sales } from './pages/Sales'
import { Settlements } from './pages/Settlements'
import { Purchases } from './pages/Purchases'
import { Journal } from './pages/Journal'
import { COA } from './pages/COA'
import { Budget } from './pages/Budget'

function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5" style={{ height: i === 1 ? 120 : 200 }}>
          <div className="w-[30%] h-3 bg-slate-100 rounded-md mb-3" />
          <div className="w-[60%] h-5 bg-slate-100 rounded-md" />
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { loading, err, D, raw, fetchAll } = useFinanceData()

  const onSaved = () => fetchAll()

  const pendingCount = useMemo(
    () => raw.incomes.filter((i) => i.pending_settlement).length,
    [raw.incomes]
  )

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard D={D} raw={raw} />
      case 'pnl': return <ProfitLoss D={D} />
      case 'balance': return <BalanceSheet D={D} raw={raw} />
      case 'cashflow': return <Cashflow D={D} />
      case 'expenses': return <Expenses raw={raw} onSaved={onSaved} />
      case 'sales': return <Sales raw={raw} onSaved={onSaved} />
      case 'settlements': return <Settlements raw={raw} fetchAll={fetchAll} />
      case 'purchases': return <Purchases raw={raw} />
      case 'journal': return <Journal raw={raw} />
      case 'coa': return <COA raw={raw} fetchAll={fetchAll} onSaved={onSaved} />
      case 'budget': return <Budget D={D} raw={raw} fetchAll={fetchAll} onSaved={onSaved} />
      default: return <Dashboard D={D} raw={raw} />
    }
  }

  return (
    <div className="flex min-h-screen font-sans bg-slate-50">
      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onRefresh={fetchAll}
        loading={loading}
      />

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-[15px] font-bold text-slate-900 m-0">
            {NAV.find((n) => n.key === page)?.label || page}
          </h1>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer text-[11px] text-slate-500 hover:text-slate-700"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        <div className="p-4 max-w-[1200px] mx-auto">
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800 text-[13px] mb-4 flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{err}</span>
              <button
                onClick={fetchAll}
                className="ml-auto px-2.5 py-1 rounded-md border border-red-200 bg-white cursor-pointer text-[11px] text-red-800"
              >
                Retry
              </button>
            </div>
          )}
          {loading ? <SkeletonLoader /> : renderPage()}
        </div>
      </main>
    </div>
  )
}
