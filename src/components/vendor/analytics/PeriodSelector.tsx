"use client";

interface PeriodSelectorProps {
  value: string;
  onChange: (period: string) => void;
  options?: { label: string; value: string }[];
}

const defaultOptions = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "1y", value: "1y" },
];

export default function PeriodSelector({ value, onChange, options = defaultOptions }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all ${
            value === opt.value ? "bg-white text-text-1 shadow-sm" : "text-text-4 hover:text-text-2"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
