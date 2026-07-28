"use client";

import { useState, useEffect } from "react";
import { Leaf, TrendingUp, Award, TreePine } from "lucide-react";

interface ESGStats {
  totalScores: number;
  averageScore: string;
  topScore: number;
  totalCarbonOffsets: number;
}

export default function SustainabilityPage() {
  const [stats, setStats] = useState<ESGStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/esg/scores")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-800 text-navy">Sustainability Dashboard</h1>
        <p className="text-sm text-text-3 mt-1">Track ESG scores, carbon offsets, and sustainability metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Leaf, label: "Total Scores", value: stats?.totalScores || 0, color: "bg-green-50 text-green-600" },
          { icon: Award, label: "Avg Score", value: stats?.averageScore || "—", color: "bg-blue-50 text-blue-600" },
          { icon: TrendingUp, label: "Top Score", value: stats?.topScore || 0, color: "bg-orange-50 text-orange" },
          { icon: TreePine, label: "Carbon Offsets", value: stats?.totalCarbonOffsets || 0, color: "bg-emerald-50 text-emerald-600" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-800 text-navy">{card.value}</p>
                  <p className="text-xs text-text-3">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-semibold text-navy mb-4">About Kauvex ESG</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-navy mb-2">Environmental</h3>
            <ul className="space-y-1.5 text-text-3">
              <li>• Carbon footprint tracking per shipment</li>
              <li>• Carbon offset program with tree planting</li>
              <li>• Eco-friendly packaging scoring</li>
              <li>• Energy and water usage ratings</li>
              <li>• Waste management assessment</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-navy mb-2">Social</h3>
            <ul className="space-y-1.5 text-text-3">
              <li>• Fair labor practice scoring</li>
              <li>• Vendor diversity tracking</li>
              <li>• Community impact programs</li>
              <li>• Buyer protection metrics</li>
              <li>• Accessibility compliance</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-navy mb-2">Governance</h3>
            <ul className="space-y-1.5 text-text-3">
              <li>• Transparent platform policies</li>
              <li>• Vendor appeal process</li>
              <li>• Dispute transparency reporting</li>
              <li>• Data privacy compliance</li>
              <li>• Annual ESG report</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}