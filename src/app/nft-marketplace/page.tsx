"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, Search, Star, ShoppingBag, Wallet, TrendingUp, Sparkles, Award, Gavel } from "lucide-react";

interface NftItem {
  id: string;
  title: string;
  creator: string;
  price: string;
  currency: string;
  blockchain: string;
  editions: number;
  likes: number;
  image: string;
  category: string;
  onSale: boolean;
  hasAuction: boolean;
}

export default function NFTMarketplacePage() {
  const [activeTab, setActiveTab] = useState("all");

  const nfts: NftItem[] = [
    { id: "n1", title: "Cyber Lagos #001", creator: "ArtByKemi", price: "0.5", currency: "ETH", blockchain: "Ethereum", editions: 1, likes: 234, image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=300&h=300&fit=crop", category: "Digital Art", onSale: true, hasAuction: false },
    { id: "n2", title: "Abstract Dreams", creator: "DesignHouseNG", price: "0.25", currency: "ETH", blockchain: "Polygon", editions: 50, likes: 189, image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=300&fit=crop", category: "Abstract", onSale: true, hasAuction: true },
    { id: "n3", title: "Queen of the Nile", creator: "CultureArt", price: "1.2", currency: "ETH", blockchain: "Ethereum", editions: 1, likes: 567, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop", category: "Portrait", onSale: true, hasAuction: false },
    { id: "n4", title: "Neon Genesis", creator: "SketchLab", price: "0.08", currency: "ETH", blockchain: "Polygon", editions: 100, likes: 98, image: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=300&h=300&fit=crop", category: "Digital Art", onSale: false, hasAuction: false },
    { id: "n5", title: "Serenity Falls", creator: "ArtByKemi", price: "0.35", currency: "ETH", blockchain: "Polygon", editions: 25, likes: 312, image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=300&h=300&fit=crop", category: "Nature", onSale: true, hasAuction: true },
    { id: "n6", title: "Urban Pulse", creator: "DesignHouseNG", price: "0.15", currency: "ETH", blockchain: "Polygon", editions: 75, likes: 156, image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=300&fit=crop", category: "Abstract", onSale: true, hasAuction: false },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gradient-to-br from-purple-900 via-gray-950 to-indigo-950 border-b border-white/10 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={28} className="text-purple-400" />
            <h1 className="text-3xl font-bold">NFT Marketplace</h1>
          </div>
          <p className="text-gray-400">Buy, sell, and collect unique digital artworks as NFTs on Ethereum &amp; Polygon.</p>
          <div className="flex gap-3 mt-4">
            <Button className="bg-purple-600 hover:bg-purple-700"><Wallet size={14} className="mr-1" /> Connect Wallet</Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10"><Image size={14} className="mr-1" /> Create NFT</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto">
          {["all", "art", "collectibles", "photography", "music", "virtual-worlds"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
              {tab === "all" ? "All NFTs" : tab.replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input placeholder="Search NFTs..." className="w-full h-11 pl-10 pr-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500" />
          </div>
          <select className="h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white">
            <option>Recent</option><option>Price: Low</option><option>Price: High</option><option>Most Liked</option>
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map(nft => (
            <div key={nft.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all group">
              <div className="h-48 bg-gray-800 overflow-hidden">
                <img src={nft.image} alt={nft.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm truncate">{nft.title}</h3>
                  {nft.hasAuction && <Gavel size={14} className="text-purple-400" />}
                </div>
                <p className="text-xs text-gray-500">by {nft.creator}</p>
                <div className="flex items-center gap-1 text-xs">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-400">{nft.likes} likes</span>
                  <span className="text-gray-500 mx-1">·</span>
                  <span className="text-gray-400">{nft.editions} edition{nft.editions > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-bold text-purple-400">{nft.price} {nft.currency}</span>
                    <span className="text-[10px] text-gray-500 ml-1.5 bg-white/5 px-1.5 py-0.5 rounded">{nft.blockchain}</span>
                  </div>
                  {nft.onSale && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-8 text-xs">
                      <ShoppingBag size={12} className="mr-1" /> Buy
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Award size={18} className="text-purple-400" /> How NFT Marketplace Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Connect Wallet", desc: "Link your crypto wallet (MetaMask, WalletConnect, or Coinbase Wallet)" },
              { step: "2", title: "Browse & Collect", desc: "Discover unique NFTs from creators worldwide. Buy with ETH or MATIC." },
              { step: "3", title: "Create & Sell", desc: "Mint your own digital artworks as NFTs and list them for sale." },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
