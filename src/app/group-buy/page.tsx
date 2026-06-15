"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Clock, Share2, CheckCircle, TrendingDown } from "lucide-react";

export default function GroupBuyPage() {
  const [deals] = useState([
    { id: "1", product: "Blender Pro 2000W", image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=200&h=200&fit=crop", regularPrice: "₦45,000", groupPrice: "₦32,000", target: 5, current: 3, discount: 29, endsIn: "18h 24m", vendor: "Kitchen World" },
    { id: "2", product: "Wireless Earbuds Pro", image: "https://images.unsplash.com/photo-1590658268035-6d6556c3c3b8?w=200&h=200&fit=crop", regularPrice: "₦25,000", groupPrice: "₦18,000", target: 10, current: 7, discount: 28, endsIn: "1d 6h", vendor: "TechHub NG" },
    { id: "3", product: "Smart Watch S3", image: "https://images.unsplash.com/photo-1546868871-af0de0ae72b8?w=200&h=200&fit=crop", regularPrice: "₦85,000", groupPrice: "₦62,000", target: 5, current: 1, discount: 27, endsIn: "2d 12h", vendor: "Gadget Galaxy" },
    { id: "4", product: "Portable Speaker Boom", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop", regularPrice: "₦35,000", groupPrice: "₦24,500", target: 8, current: 5, discount: 30, endsIn: "3d 8h", vendor: "AudioPro NG" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-700 to-[#FF6B00] text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Group Buy Deals</h1>
          <p className="text-white/80">Buy together, save more! Invite friends and unlock lower prices.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["All Deals", "Closing Soon", "Almost There", "Just Started"].map(tab => (
            <button key={tab} className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:border-[#FF6B00] whitespace-nowrap">{tab}</button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map(deal => (
            <div key={deal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100">
                <img src={deal.image} alt={deal.product} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#FF6B00] text-white text-sm font-bold px-2 py-1 rounded-lg">
                  -{deal.discount}%
                </div>
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-[#0A1628]">{deal.product}</h3>
                <p className="text-xs text-gray-500">{deal.vendor}</p>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#FF6B00]">{deal.groupPrice}</span>
                  <span className="text-sm text-gray-400 line-through">{deal.regularPrice}</span>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-purple-700 mb-2">
                    <span><Users size={12} className="inline mr-1" />{deal.current}/{deal.target} joined</span>
                    <span><Clock size={12} className="inline mr-1" />{deal.endsIn}</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(deal.current / deal.target) * 100}%` }} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#FF6B00] hover:bg-[#e86000] text-sm h-9">Join Group</Button>
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Share2 size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#0A1628] mb-3">How Group Buy Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Pick a Deal", desc: "Browse group buy deals and pick a product you want" },
              { step: "2", title: "Invite Friends", desc: "Share the deal link with friends who want the same product" },
              { step: "3", title: "Everyone Saves", desc: "When enough people join, everyone pays the lower group price" },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#FF6B00] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-semibold text-[#0A1628]">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
