"use client";

import { Check, Circle, Clock, Truck, XCircle } from "lucide-react";

interface TimelineStep {
  status: string;
  label: string;
  date: string | null;
}

interface ReturnTimelineProps {
  statusHistory: TimelineStep[];
  currentStatus: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: "border-yellow-400 text-yellow-600", icon: Clock },
  label_created: { color: "border-blue-400 text-blue-600", icon: Truck },
  picked_up: { color: "border-blue-400 text-blue-600", icon: Truck },
  in_transit: { color: "border-blue-400 text-blue-600", icon: Truck },
  delivered_back: { color: "border-green-400 text-green-600", icon: Check },
  completed: { color: "border-green-500 text-green-600", icon: Check },
  cancelled: { color: "border-red-400 text-red-600", icon: XCircle },
  approved: { color: "border-green-400 text-green-600", icon: Check },
  resolved: { color: "border-green-500 text-green-600", icon: Check },
};

const stepOrder = ["pending", "approved", "label_created", "picked_up", "in_transit", "delivered_back", "completed"];

export default function ReturnTimeline({ statusHistory, currentStatus }: ReturnTimelineProps) {
  if (!statusHistory || statusHistory.length === 0) {
    const config = statusConfig[currentStatus] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${config.color}`}>
          <Icon size={14} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 capitalize">{currentStatus.replace(/_/g, " ")}</p>
          <p className="text-xs text-gray-500">Current status</p>
        </div>
      </div>
    );
  }

  const currentIdx = statusHistory.length - 1;

  return (
    <div className="space-y-0">
      {statusHistory.map((step, idx) => {
        const config = statusConfig[step.status] || statusConfig.pending;
        const Icon = config.icon;
        const isActive = idx === currentIdx;
        const isPast = idx < currentIdx;

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0
                  ${isPast || isActive ? config.color : "border-gray-200 text-gray-300"}
                  ${isActive ? "ring-2 ring-offset-2 ring-[#FF6B00]/30" : ""}`}
              >
                {isPast ? <Check size={14} /> : <Icon size={14} />}
              </div>
              {idx < statusHistory.length - 1 && (
                <div className={`w-0.5 h-8 ${isPast ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
            <div className={`pb-6 ${!isActive ? "opacity-60" : ""}`}>
              <p className="text-sm font-medium text-gray-900">{step.label}</p>
              {step.date && (
                <p className="text-xs text-gray-500">
                  {new Date(step.date).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}