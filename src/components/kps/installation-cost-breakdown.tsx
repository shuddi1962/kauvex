"use client";

import { MapPin, Truck, Fuel, Clock, Wrench, AlertTriangle, Star } from "lucide-react";

interface InstallationCostBreakdown {
  baseFee: number;
  distanceSurcharge: number;
  travelTimeCost: number;
  fuelCost: number;
  tollCost: number;
  consumablesCost: number;
  complexitySurcharge: number;
  totalInstallation: number;
  professionalName: string;
  professionalRating: number;
  distanceFromCustomerKm: number;
  estimatedTravelMinutes: number;
  estimatedJobDuration: string;
  vehicleType: string;
}

interface Props {
  cost: InstallationCostBreakdown;
  currency?: string;
  compact?: boolean;
}

function formatPrice(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€" };
  const sym = symbols[currency] || "₦";
  return `${sym}${amount.toLocaleString("en-US")}`;
}

export default function InstallationCostBreakdown({
  cost,
  currency = "NGN",
  compact = false,
}: Props) {
  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wrench size={14} className="text-blue" />
            <span className="text-xs font-bold text-blue">Installation by {cost.professionalName}</span>
          </div>
          <span className="text-xs font-bold text-blue">{formatPrice(cost.totalInstallation, currency)}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-text-4">
          <span className="flex items-center gap-1"><MapPin size={10} /> {cost.distanceFromCustomerKm}km</span>
          <span className="flex items-center gap-1"><Star size={10} className="fill-yellow-400 text-yellow-400" /> {cost.professionalRating}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {cost.estimatedJobDuration}</span>
        </div>
      </div>
    );
  }

  const items = [
    { label: "Base Installation Fee", value: cost.baseFee, icon: Wrench },
    ...(cost.distanceSurcharge > 0 ? [{ label: `Distance Surcharge (${cost.distanceFromCustomerKm}km)`, value: cost.distanceSurcharge, icon: MapPin }] : []),
    ...(cost.travelTimeCost > 0 ? [{ label: "Travel Time", value: cost.travelTimeCost, icon: Clock }] : []),
    { label: `Fuel Cost (${cost.vehicleType})`, value: cost.fuelCost, icon: Fuel },
    ...(cost.tollCost > 0 ? [{ label: "Toll Fees", value: cost.tollCost, icon: Truck }] : []),
    ...(cost.consumablesCost > 0 ? [{ label: "Materials & Consumables", value: cost.consumablesCost, icon: Wrench }] : []),
    ...(cost.complexitySurcharge > 0 ? [{ label: "Complex Job Surcharge", value: cost.complexitySurcharge, icon: AlertTriangle }] : []),
  ];

  return (
    <div className="bg-white rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Wrench size={16} className="text-blue" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-1">Installation by {cost.professionalName}</h4>
            <div className="flex items-center gap-2 text-[10px] text-text-4">
              <span className="flex items-center gap-1"><Star size={10} className="fill-yellow-400 text-yellow-400" /> {cost.professionalRating}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin size={10} /> {cost.distanceFromCustomerKm}km away</span>
              <span>•</span>
              <span>~{cost.estimatedTravelMinutes}min travel</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-text-3">
              <item.icon size={12} className="text-text-4" />
              {item.label}
            </span>
            <span className="font-semibold text-text-1">{formatPrice(item.value, currency)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex items-center justify-between text-sm">
          <span className="font-bold text-text-1">Total Installation</span>
          <span className="font-bold text-blue">{formatPrice(cost.totalInstallation, currency)}</span>
        </div>
      </div>

      <p className="text-[9px] text-text-4 mt-2">
        Estimated job duration: {cost.estimatedJobDuration}. Price includes travel both ways.
      </p>
    </div>
  );
}