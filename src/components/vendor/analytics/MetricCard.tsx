"use client";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  value: string;
  label: string;
  change?: string;
  up?: boolean;
  sublabel?: string;
  icon?: React.ElementType;
  color?: string;
}

export default function MetricCard({ value, label, change, up, sublabel, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        {Icon && color ? (
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon size={15} />
          </div>
        ) : (
          <div className="w-8 h-8" />
        )}
        {change !== undefined && (
          <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${up ? "text-green-600" : "text-red-500"}`}>
            {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {change}
          </span>
        )}
      </div>
      <p className="font-bold text-lg text-text-1">{value}</p>
      <p className="text-[10px] text-text-4">{label}</p>
      {sublabel && <p className="text-[9px] text-text-4 mt-0.5">{sublabel}</p>}
    </div>
  );
}
