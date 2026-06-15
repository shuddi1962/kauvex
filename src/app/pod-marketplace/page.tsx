"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Search, ShoppingBag, Star } from "lucide-react";

export default function PODMarketplacePage() {
  const [designs] = useState([
    { id: "1", name: "Geometric Waves", creator: "ArtByKemi", price: "₦5,000", sales: 12, rating: 4.8, image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=200&fit=crop", category: "Abstract" },
    { id: "2", name: "Tropical Vibes", creator: "DesignHouseNG", price: "₦3,500", sales: 8, rating: 4.6, image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop", category: "Nature" },
    { id: "3", name: "Minimalist Lines", creator: "SketchLab", price: "₦4,000", sales: 21, rating: 4.9, image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=200&fit=crop", category: "Minimalist" },
    { id: "4", name: "African Print Pattern", creator: "CultureArt", price: "₦6,000", sales: 34, rating: 5.0, image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=200&h=200&fit=crop", category: "Cultural" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-700 to-pink-600 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Palette size={28} />
            <h1 className="text-3xl font-bold">POD Design Marketplace</h1>
          </div>
          <p className="text-white/80">Browse designs from creators worldwide. License them for your print-on-demand products.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search designs..." className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
          </div>
          <select className="h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white">
            <option>All Categories</option><option>Abstract</option><option>Nature</option>
            <option>Minimalist</option><option>Cultural</option><option>Typography</option>
          </select>
          <select className="h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white">
            <option>Most Popular</option><option>Newest</option><option>Price: Low</option><option>Price: High</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {designs.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-[#0A1628]">{d.name}</h3>
                <p className="text-xs text-gray-500">by {d.creator}</p>
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{d.rating}</span>
                  <span className="text-gray-400">({d.sales} sales)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#FF6B00]">{d.price}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{d.category}</span>
                </div>
                <Button className="w-full bg-[#FF6B00] hover:bg-[#e86000] text-sm h-9">
                  <ShoppingBag size={14} className="mr-1" /> License Design
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#0A1628] mb-3">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Palette size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold">Browse & License</h3>
              <p className="text-sm text-gray-500 mt-1">Find a design you like and buy a one-time license</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold">Create Products</h3>
              <p className="text-sm text-gray-500 mt-1">Apply the design to any POD product in your studio</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold">Sell & Earn</h3>
              <p className="text-sm text-gray-500 mt-1">List your products and earn profits on every sale</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
