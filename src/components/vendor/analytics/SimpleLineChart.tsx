"use client";

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showLabels?: boolean;
  formatValue?: (v: number) => string;
}

export default function SimpleLineChart({
  data,
  height = 200,
  color = "#FF6B00",
  showLabels = true,
  formatValue,
}: SimpleLineChartProps) {
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;
  const padding = { top: 20, right: 20, bottom: showLabels ? 30 : 10, left: 50 };
  const width = Math.max(data.length * 50, 300);

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);
    const y = padding.top + ((maxVal - d.value) / range) * (height - padding.top - padding.bottom);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const areaD = `${pathD} L${points[points.length - 1].x},${height - padding.bottom} L${points[0].x},${height - padding.bottom} Z`;

  const yTicks = 5;
  const yStep = range / yTicks;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {/* Grid lines */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const yVal = minVal + yStep * i;
        const yPos = padding.top + ((maxVal - yVal) / range) * (height - padding.top - padding.bottom);
        return (
          <g key={i}>
            <line x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="#E5E7EB" strokeWidth="1" />
            <text x={padding.left - 6} y={yPos + 3} textAnchor="end" className="text-[9px]" fill="#9CA3AF">
              {formatValue ? formatValue(yVal) : Math.round(yVal).toString()}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill={`${color}15`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="white" strokeWidth="2" />
      ))}

      {/* Bottom labels */}
      {showLabels &&
        points.map((p, i) => (
          <text key={i} x={p.x} y={height - 5} textAnchor="middle" className="text-[8px]" fill="#9CA3AF">
            {p.label}
          </text>
        ))}
    </svg>
  );
}
