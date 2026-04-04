/** Format Rupiah: Rp 1.250.000, negatif: (Rp 500.000) */
export function fR(n) {
  const v = Number(n || 0)
  if (v < 0) return `(Rp ${new Intl.NumberFormat('id-ID').format(Math.abs(v))})`
  return `Rp ${new Intl.NumberFormat('id-ID').format(v)}`
}

/** Format short: 1.5M, 2.3jt, 500rb */
export function fS(n) {
  const v = Math.abs(Number(n || 0))
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}M`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}jt`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}rb`
  return v.toString()
}

/** Format date: 03 Apr 2026 */
export function fD(d) {
  if (!d) return '-'
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Normalize channel: web→shopify, terjual→event */
export function normCh(c) {
  if (c === 'web') return 'shopify'
  if (c === 'terjual') return 'event'
  return c
}

/** Today YYYY-MM-DD */
export function td() {
  return new Date().toISOString().split('T')[0]
}

/** Month start YYYY-MM-01 */
export function ms() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

/** Current period YYYY-MM */
export function cp() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Yesterday YYYY-MM-DD */
export function yd() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

/** 30 days ago YYYY-MM-DD */
export function d30() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

/** Days between two dates */
export function daysBetween(a, b) {
  return Math.floor((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24))
}
