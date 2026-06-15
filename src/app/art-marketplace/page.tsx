"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Image, Download, Star, ShoppingBag } from "lucide-react";

export default function ArtMarketplacePage() {
  const [artworks] = useState([
    { id: "1", title: "Sunset Over Lagos", creator: "ArtByKemi", price: "₦12,000", rating: 4.9, sales: 45, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop", category: "Digital Art" },
    { id: "2", title: "Abstract Harmony", creator: "DesignHouseNG", price: "₦8,500", rating: 4.7, sales: 23, image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=300&fit=crop", category: "Abstract" },
    { id: "3", title: "African Queen", creator: "CultureArt", price: "₦15,000", rating: 5.0, sales: 67, image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=300&h=300&fit=crop", category: "Portrait" },
    { id: "4", title: "Neon Dreams", creator: "SketchLab", price: "₦6,500", rating: 4.5, sales: 12, image: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=300&h=300&fit=crop", category: "Digital Art" },
    { id: "5", title: "Serenity", creator: "ArtByKemi", price: "₦10,000", rating: 4.8, sales: 31, image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&h=300&fit=crop", category: "Nature" },
    { id: "6", title: "Urban Jungle", creator: "DesignHouseNG", price: "₦9,000", rating: 4.6, sales: 19, image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=300&fit=crop", category: "Abstract" },
  ]);

  const categories = ["All", "Digital Art", "Abstract", "Portrait", "Nature", "Typography", "Photography", "3D Art"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#0A1628] via-[#1a2a4a] to-purple-900 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Image size={28} className="text-purple-400" />
            <h1 className="text-3xl font-bold">Digital Art Marketplace</h1>
          </div>
          <p className="text-gray-400">Buy and sell digital art, illustrations, and designs. Full commercial licenses included.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search art..." className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">Search</Button>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {categories.map(c => (
            <button key={c} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${c === 'All' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-500'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artworks.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-52 bg-gray-100 overflow-hidden">
                <img src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-[#0A1628]">{a.title}</h3>
                <p className="text-xs text-gray-500">by {a.creator}</p>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{a.rating}</span>
                  <span className="text-gray-400">({a.sales} sold)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-600 text-lg">{a.price}</span>
                  <span className="text-xs text-gray-400">{a.category}</span>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-sm h-9">
                    <ShoppingBag size={14} className="mr-1" /> Buy
                  </Button>
                  <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <Download size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#0A1628] mb-3">Mode A — Digital Downloads</h2>
          <p className="text-sm text-gray-500">All purchases include a high-resolution file and commercial license certificate. No blockchain or crypto required. Simple fiat payment via your preferred method.</p>
          <div className="flex gap-4 mt-4">
            <div className="flex items-start gap-2">
              <Download size={16} className="text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Instant Download</p>
                <p className="text-xs text-gray-400">Get your files immediately after purchase</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Star size={16} className="text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">License Included</p>
                <p className="text-xs text-gray-400">Commercial and personal use licenses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
