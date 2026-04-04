import { NAV } from '../utils/constants'
import { ChevronsLeft, ChevronsRight, RefreshCw } from 'lucide-react'

export function Sidebar({ page, setPage, collapsed, setCollapsed, onRefresh, loading }) {
  return (
    <aside
      className={`bg-slate-900 text-white flex flex-col transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      } min-h-screen`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        {!collapsed && <span className="font-bold text-sm tracking-wide">PSC Finance</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-2">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = page === item.key
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium border-none cursor-pointer transition-colors ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={16} />
              {!collapsed && item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-800">
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`w-full flex items-center gap-2 justify-center py-2 rounded-lg text-xs font-medium border-none cursor-pointer transition-colors ${
            loading ? 'text-slate-600' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {!collapsed && (loading ? 'Loading...' : 'Refresh')}
        </button>
      </div>
    </aside>
  )
}
