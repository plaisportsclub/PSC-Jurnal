# CLAUDE.md — PSC Finance

## Project Overview
PSC Finance adalah financial dashboard untuk Plai Sports Club (brand sportswear Indonesia).
Frontend-only React app yang connect langsung ke Supabase (no backend server).
Menggantikan Jurnal.id (Rp 6jt/tahun).

## Tech Stack
- **React 18** + Vite (build tool)
- **Tailwind CSS** (utility classes)
- **Recharts** (charts/graphs)
- **lucide-react** (icons)
- **Supabase** (database + auth, direct from frontend)
- **Deploy**: GitHub Pages (static build)

## Supabase
- **Project ID**: `tbbosaoffbsmywzarlqy`
- **URL**: `https://tbbosaoffbsmywzarlqy.supabase.co`
- **Anon Key**: Stored in `.env` as `VITE_SUPABASE_KEY` — JANGAN hardcode di source code
- **Auth**: Semua tabel RLS enabled, query pakai anon key
- **Edge Function**: `shopify-webhook` (untuk Shopify order sync)

## Quick Commands
```bash
npm run dev          # Local development server
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run deploy       # Build + deploy ke GitHub Pages
```

## Project Structure
```
psc-finance/
├── public/
├── src/
│   ├── components/     # Shared UI components (Card, DataTable, Badge, etc)
│   ├── pages/          # Page components (Dashboard, PnL, Expenses, etc)
│   ├── lib/
│   │   └── supabase.js # Supabase client + helper functions
│   ├── utils/
│   │   └── format.js   # Currency formatter, date formatter, etc
│   ├── App.jsx         # Main app with routing
│   └── main.jsx        # Entry point
├── .env                # VITE_SUPABASE_URL, VITE_SUPABASE_KEY
├── .env.example        # Template for .env
├── vite.config.js
├── tailwind.config.js
├── package.json
├── CLAUDE.md           # This file
└── README.md
```

## Database Tables

### Finance (READ + WRITE)
| Table | Rows | App Can Write? |
|-------|------|----------------|
| `expenses` | 102+ | ✅ Owner, Ops (manual input + import) |
| `incomes` | 248+ | ✅ Owner, Ops (manual input + import) |
| `chart_of_accounts` | 31 | ✅ Owner only (CRUD) |
| `budgets` | 7+ | ✅ Owner only (CRUD) |
| `export_log` | 0 | ✅ Owner, Akuntan (log exports) |
| `monthly_snapshots` | 0 | ✅ System (period closing) |

### Finance (READ-ONLY dari app, WRITE oleh agent)
| Table | Rows | Alasan |
|-------|------|--------|
| `journal_entries` | 106 | Domain Accounting Agent |
| `purchases` | 3 | Domain Accounting Agent |
| `purchase_payments` | 0 | Domain Accounting Agent |
| `marketplace_settlements` | 0 | Domain Accounting Agent |
| `agent_flags` | 53 | Domain Agent system |

### Ops (READ-ONLY, jangan write)
| Table | Rows | Alasan |
|-------|------|--------|
| `inventory` | 309 | Domain Desty/ops system |
| `transactions` | 75 | Domain Desty/ops system |
| `channel_allocation` | 1205 | Domain inventory system |

## Channel Mapping (PENTING)
Raw channel di DB perlu normalisasi untuk display:
```js
// web → shopify (sama platform)
// terjual → event (offline walk-in)
// tokopedia = TikTok Seller (satu platform, display "Tokped/TikTok")
const normCh = (c) => c === "web" ? "shopify" : c === "terjual" ? "event" : c;
```

Direct channels (uang langsung masuk BCA): wa, dm, shopify, event
Marketplace channels (butuh settlement): shopee, tokopedia

## COA System
- Payment account: `1-10002-2` (BCA Gaby) — satu-satunya
- Revenue: `4-40000` (Products), `7-70099` (Shipping Income)
- COGS: `5-50001` (Packaging), `5-50300` (Shipping), journal_entries COGS/PRODUCTION
- Selling: `6-60001` s/d `6-60009`
- G&A: `6-60100` s/d `6-60304`
- Account name di expenses TIDAK konsisten → normalize dari chart_of_accounts table

## Revenue Target
- Maret 2026: Rp 40jt
- Q2-Q3 2026: Rp 50jt/bulan
- Target dari tabel `budgets` (budget_type = 'revenue')
- Revenue = GROSS (products + shipping income)

## Formatting Rules
- Currency: `Rp 1.250.000` → `new Intl.NumberFormat('id-ID').format(amount)`
- All amounts stored as `bigint` (no decimal)
- Negative: red color, format `(Rp 500.000)`
- Dates: `DD MMM YYYY` (e.g. "03 Apr 2026")

## ID Generation
Tables `incomes` dan `expenses` pakai epoch-based ID (bukan auto-increment).
Default sudah di-set: `EXTRACT(epoch FROM now())::bigint * 1000 + floor(random() * 999)`.
App bisa insert tanpa explicit ID.

## Development Rules
1. Setiap halaman/fitur baru = commit terpisah
2. Test query dulu di Supabase sebelum build UI
3. JANGAN install package yang gak perlu
4. Normalize account_name display dari chart_of_accounts, bukan dari expenses.account_name
5. Semua amount bigint, format Rp
6. Mobile-first responsive
7. JANGAN hardcode Supabase key — pakai env variable

## Pages (11 halaman, sudah prototype di artifact)
1. **Dashboard** — Health Score, Revenue vs Target, Channel donut, Trend
2. **P&L** — Monthly statement, date filter, CSV export
3. **Balance Sheet** — Estimated: Cash, AR, Inventory, Fixed Assets
4. **Cashflow** — Daily in/out bar, running balance area chart
5. **Expenses** — Charts (category, recipient, weekly), input form, table
6. **Sales** — Charts (channel, AOV, monthly stacked), input form, table
7. **Settlements** — Pending aging, mark settled, marketplace comparison
8. **Purchases** — PO list with status
9. **Journal** — Ledger view, date filter, CSV export
10. **COA** — CRUD, grouped by type, activate/deactivate
11. **Budget** — CRUD, budget vs actual, copy previous month

## Health Score Formula
```
score = 100
- net_margin < 0%: -40 | < 10%: -20 | < 20%: -10
- rev_pct_target < 30%: -20 | < 50%: -15 | < 70%: -5
- expense_ratio > 50%: -15 | > 40%: -10
- agent_flags > 10: -10 | > 5: -5
- inventory/revenue > 3: -10
Traffic: 80-100 green, 50-79 yellow, 0-49 red
```

## Plai Brain Ecosystem
PSC Finance = visual dashboard layer. Bagian dari Plai Brain multi-agent system:
- **Accounting Agent** (Telegram/WA) — WRITE ke Supabase (deploying)
- **Finance Agent** (Telegram) — READ + analytics push (development)
- **PSC Finance** (browser) — READ + display + limited WRITE (ini)

Agent dan app baca dari Supabase yang sama. App punya manual input sebagai fallback karena agent belum fully live.

## User Roles (nanti, pakai Supabase Auth)
- **Owner**: Semua akses + settings + bisa grant akses ke role lain
- **Tim Ops**: Input transaksi, lihat expense/income, NO margin/profit
- **Akuntan**: Lihat semua + export, NO edit (default, bisa di-override owner)
- **Investor**: P&L summary, revenue trend, health score ONLY
