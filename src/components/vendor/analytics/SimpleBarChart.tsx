"use client";

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarItem[];
  height?: number;
  barColor?: string;
  showValues?: boolean;
  formatValue?: (v: number) => string;
  horizontal?: boolean;
}

export default function SimpleBarChart({
  data,
  height = 200,
  barColor = "#FF6B00",
  showValues = true,
  formatValue,
  horizontal = false,
}: SimpleBarChartProps) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 10, right: 10, bottom: 30, left: horizontal ? 100 : 40 };

  if (horizontal) {
    const rowH = Math.max(24, Math.floor(height / data.length));
    const chartH = rowH * data.length + padding.top + padding.bottom;
    const chartW = 400;

    return (
      <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
        {data.map((d, i) => {
          const y = padding.top + i * rowH;
          const barW = (d.value / maxVal) * (chartW - padding.left - padding.right);
          return (
            <g key={i}>
              <text x={padding.left - 6} y={y + rowH / 2 + 3} textAnchor="end" className="text-[9px]" fill="#6B7280">
                {d.label}
              </text>
              <rect
                x={padding.left}
                y={y + 3}
                width={Math.max(barW, 4)}
                height={rowH - 6}
                rx="4"
                fill={d.color || barColor}
                opacity={0.85}
              />
              {showValues && (
                <text x={padding.left + barW + 4} y={y + rowH / 2 + 3} className="text-[9px]" fill="#374151" fontWeight="600">
                  {formatValue ? formatValue(d.value) : d.value.toLocaleString()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  const barW = Math.max(20, (300 / data.length) - 8);
  const chartW = Math.max(data.length * (barW + 8) + padding.left + padding.right, 300);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${chartW} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const yPos = padding.top + (1 - frac) * (height - padding.top - padding.bottom);
        return (
          <g key={frac}>
            <line x1={padding.left} y1={yPos} x2={chartW - padding.right} y2={yPos} stroke="#E5E7EB" strokeWidth="1" />
            <text x={padding.left - 4} y={yPos + 3} textAnchor="end" className="text-[8px]" fill="#9CA3AF">
              {formatValue ? formatValue(Math.round(maxVal * frac)) : Math.round(maxVal * frac).toString()}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = padding.left + i * (barW + 8) + 4;
        const barH = (d.value / maxVal) * (height - padding.top - padding.bottom);
        const y = height - padding.bottom - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill={d.color || barColor} opacity={0.85} />
            {showValues && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="text-[8px]" fill="#374151">
                {formatValue ? formatValue(d.value) : d.value.toLocaleString()}
              </text>
            )}
            <text x={x + barW / 2} y={height - 4} textAnchor="middle" className="text-[8px]" fill="#9CA3AF">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
