export function exportCSV(rows, filename) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const csv = [
    keys.join(','),
    ...rows.map((r) =>
      keys
        .map((k) => {
          const v = r[k] ?? ''
          return typeof v === 'string' && (v.includes(',') || v.includes('"'))
            ? `"${v.replace(/"/g, '""')}"`
            : v
        })
        .join(',')
    ),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
