export function HealthGauge({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
  const angle = (score / 100) * 180
  const rad = (a) => (a * Math.PI) / 180
  const cx = 100
  const cy = 90
  const r = 70

  return (
    <div className="text-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx + r * Math.cos(rad(180))} ${cy - r * Math.sin(rad(180))} A ${r} ${r} 0 ${
            angle > 180 ? 1 : 0
          } 1 ${cx + r * Math.cos(rad(180 - angle))} ${cy - r * Math.sin(rad(180 - angle))}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill={color}
          className="text-[32px] font-mono font-bold"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill="#94a3b8"
          className="text-[11px]"
        >
          {score >= 80 ? 'Healthy' : score >= 50 ? 'Needs Attention' : 'Critical'}
        </text>
      </svg>
    </div>
  )
}
