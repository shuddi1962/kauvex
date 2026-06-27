"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Info, TrendingUp, TrendingDown, DollarSign, Calendar, Zap } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;
  return { daysInMonth, startDay };
}

const RATE_DATA: Record<string, { base: number; surge: number; demand: string }> = {};
const DEMAND_LEVELS = ["low", "medium", "high", "peak"];
const NOW_YEAR = 2026;
for (let m = 0; m < 12; m++) {
  const { daysInMonth } = getDaysInMonth(NOW_YEAR, m);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${NOW_YEAR}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = new Date(NOW_YEAR, m, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 12.99 : 9.99;
    const surgeSeed = ((m * 31 + d) * 7) % 10;
    const surge = isWeekend ? 1.3 : surgeSeed > 7 ? 1.5 : 1.0;
    const demandSeed = ((m * 31 + d) * 13) % 10;
    const demand = isWeekend ? "peak" : surge > 1.2 ? "high" : demandSeed > 5 ? "medium" : "low";
    RATE_DATA[key] = { base, surge, demand };
  }
}

const QUICK_RATES = [
  { route: "Lagos → Abuja", standard: 9.99, express: 14.99, economy: 6.99 },
  { route: "Lagos → Accra", standard: 18.50, express: 24.99, economy: 12.99 },
  { route: "Lagos → Nairobi", standard: 32.00, express: 45.00, economy: 22.00 },
  { route: "Abuja → Kano", standard: 12.99, express: 18.50, economy: 8.99 },
];

export default function RateCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(5);
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { daysInMonth, startDay } = getDaysInMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const demandColor: Record<string, string> = {
    past: "bg-gray-100 text-gray-400",
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    peak: "bg-red-100 text-red-700",
  };

  const demandBg: Record<string, string> = {
    past: "#F3F4F6",
    low: "#D1FAE5",
    medium: "#FEF3C7",
    high: "#FFEDD5",
    peak: "#FEE2E2",
  };

  const selectedData = selectedDate ? RATE_DATA[selectedDate] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Smart Rate Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Find the best shipping rates based on demand patterns.</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#FF6B00]" />
          <span className="text-xs font-medium text-[#0A1628]">AI-powered pricing</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs font-semibold text-[#0A1628]">Demand:</span>
        {Object.entries(demandColor).filter(([k]) => k !== "past").map(([k, v]) => (
          <span key={k} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${v}`}>{k.charAt(0).toUpperCase() + k.slice(1)} Rate</span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <h2 className="text-lg font-bold text-[#0A1628]">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const data = RATE_DATA[key];
              const isToday = currentYear === 2026 && currentMonth === 5 && day === 27;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(key)}
                  className={`relative p-2 rounded-lg transition-all text-left ${selectedDate === key ? "ring-2 ring-[#FF6B00] shadow-md" : "hover:shadow-sm"}`}
                  style={{ backgroundColor: data ? demandBg[data.demand] : "#F9FAFB" }}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-[#FF6B00] font-bold" : "text-gray-700"}`}>{day}</span>
                  {data && data.demand !== "past" && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold text-[#0A1628] block">${(data.base * data.surge).toFixed(2)}</span>
                      {data.surge > 1.0 && <span className="text-[9px] text-red-600 font-medium">+{((data.surge - 1) * 100).toFixed(0)}% surge</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Selected Date Details */}
          {selectedData && selectedData.demand !== "past" ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0A1628]">Rate Details</h3>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${demandColor[selectedData.demand]}`}>
                  {selectedData.demand.charAt(0).toUpperCase() + selectedData.demand.slice(1)}
                </span>
              </div>
              <div className="bg-[#0A1628] rounded-xl p-4 text-white text-center">
                <p className="text-3xl font-bold text-[#FF6B00]">${(selectedData.base * selectedData.surge).toFixed(2)}</p>
                <p className="text-xs text-white/60 mt-1">Standard rate per kg</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Base rate</span><span className="font-medium text-[#0A1628]">${selectedData.base.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Surge multiplier</span>
                  <span className={`font-medium ${selectedData.surge > 1.0 ? "text-red-600" : "text-green-600"}`}>{selectedData.surge}x {selectedData.surge > 1.0 ? "(surge)" : "(normal)"}</span>
                </div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Express (+40%)</span><span className="font-medium text-[#0A1628]">${(selectedData.base * selectedData.surge * 1.4).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Economy (-30%)</span><span className="font-medium text-[#0A1628]">${(selectedData.base * selectedData.surge * 0.7).toFixed(2)}</span></div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-700">
                  {selectedData.demand === "peak" && "Peak demand period. Rates are higher due to limited capacity. Book early for best rates."}
                  {selectedData.demand === "high" && "High demand period. Consider using Economy service to save on costs."}
                  {selectedData.demand === "medium" && "Moderate demand. Good time to ship with standard rates."}
                  {selectedData.demand === "low" && "Low demand period. Best rates available. Ideal for bulk shipments."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select a date to view rates</p>
              </div>
            </div>
          )}

          {/* Quick Rates */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Popular Route Rates</h3>
            <div className="space-y-2">
              {QUICK_RATES.map((r, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-[#0A1628] mb-2">{r.route}</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="text-center"><span className="block text-gray-500">Econ</span><span className="font-bold text-green-600">${r.economy.toFixed(2)}</span></div>
                    <div className="text-center"><span className="block text-gray-500">Std</span><span className="font-bold text-[#0A1628]">${r.standard.toFixed(2)}</span></div>
                    <div className="text-center"><span className="block text-gray-500">Expr</span><span className="font-bold text-[#FF6B00]">${r.express.toFixed(2)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Tip */}
          <div className="bg-gradient-to-br from-[#0A1628] to-[#1A2A48] rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold">Save Up to 25%</h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Ship during low-demand periods (typically mid-week) and use Economy service for non-urgent deliveries to maximize savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
