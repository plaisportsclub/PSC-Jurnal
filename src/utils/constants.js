import {
  LayoutDashboard, FileText, CreditCard, Wallet, Receipt,
  ShoppingCart, Clock, Building2, BookOpen, BarChart3, DollarSign,
} from 'lucide-react'

export const CH_COLORS = {
  wa: '#25D366',
  shopify: '#96BF48',
  event: '#F59E0B',
  shopee: '#EE4D2D',
  tokopedia: '#42B549',
  dm: '#E1306C',
}

export const CH_LABELS = {
  wa: 'WhatsApp',
  shopify: 'Shopify',
  event: 'Event/Bazaar',
  shopee: 'Shopee',
  tokopedia: 'Tokped/TikTok',
  dm: 'DM',
}

export const CAT_COLORS = {
  '6-60001': '#3b82f6',
  '6-60008': '#f59e0b',
  '6-60009': '#8b5cf6',
  '6-60102': '#ef4444',
  '5-50300': '#06b6d4',
  '1-10705': '#64748b',
  '6-60221': '#f97316',
  '6-60207': '#ec4899',
  '6-60007': '#14b8a6',
  '6-60002': '#a855f7',
  '6-60103': '#84cc16',
  '5-50001': '#0ea5e9',
  '6-60301': '#6366f1',
  '6-60304': '#d946ef',
  '6-60005': '#eab308',
  '6-60100': '#78716c',
}

export const REV_PRODUCTS = ['4-40000', '4-40001', '4-40002', '4-40004', '4-40005']
export const REV_ALL = [...REV_PRODUCTS, '7-70099']
export const isRevProduct = (code) => REV_PRODUCTS.includes(code)
export const isRevAny = (code) => REV_ALL.includes(code)

export const CH_TO_REV = {
  shopify: '4-40000', web: '4-40000',
  wa: '4-40001', terjual: '4-40001', dm: '4-40001',
  shopee: '4-40002',
  tokopedia: '4-40004',
  event: '4-40005',
}

export const SELLING = ['6-60001', '6-60002', '6-60005', '6-60007', '6-60008', '6-60009']
export const GA = [
  '6-60100', '6-60102', '6-60103', '6-60207', '6-60209', '6-60214',
  '6-60221', '6-60222', '6-60223', '6-60224', '6-60301', '6-60303', '6-60304',
]
export const OPEX = [...SELLING, ...GA]

export const CHANNELS = ['wa', 'dm', 'shopify', 'shopee', 'tokopedia', 'event']

export const TYPE_OPTS = [
  { value: 'asset', label: 'Asset' },
  { value: 'income', label: 'Income' },
  { value: 'cogs', label: 'COGS' },
  { value: 'expense', label: 'Expense' },
]

export const CAT_OPTS = [
  { value: 'cash', label: 'Cash' },
  { value: 'receivable', label: 'Receivable' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'fixed_asset', label: 'Fixed Asset' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'other_income', label: 'Other Income' },
  { value: 'cost_of_sales', label: 'Cost of Sales' },
  { value: 'production', label: 'Production' },
  { value: 'selling', label: 'Selling' },
  { value: 'ga', label: 'G&A' },
]

export const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'pnl', label: 'P&L', icon: FileText },
  { key: 'balance', label: 'Balance Sheet', icon: CreditCard },
  { key: 'cashflow', label: 'Cashflow', icon: Wallet },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'sales', label: 'Sales', icon: ShoppingCart },
  { key: 'settlements', label: 'Settlements', icon: Clock },
  { key: 'purchases', label: 'Purchases', icon: Building2 },
  { key: 'journal', label: 'Journal', icon: BookOpen },
  { key: 'coa', label: 'COA', icon: BarChart3 },
  { key: 'budget', label: 'Budget', icon: DollarSign },
]
