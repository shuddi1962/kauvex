"use client";

import { useState } from "react";
import {
  Users, Image, ShoppingBag, BarChart3, Plus, Eye, Edit, Trash2,
  CheckCircle, XCircle, Instagram, Youtube, Music, Camera, Heart,
  MessageCircle, Star, ExternalLink, Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const socialTabs = [
  { id: "creators", label: "Creators", icon: Users },
  { id: "content", label: "Content Feed", icon: Image },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

interface Creator {
  id: string;
  full_name: string;
  handle: string;
  avatar: string;
  followers: number;
  total_views: number;
  total_sales: number;
  is_verified: boolean;
  status: string;
  platform: string;
}

interface ContentItem {
  id: string;
  creator_name: string;
  title: string;
  content_type: "video" | "image" | "reel" | "story";
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  shoppable: boolean;
  products_pinned: { product_name: string; clicks: number; sales: number }[];
}

const seedCreators: Creator[] = [
  { id: "c1", full_name: "Amara Okafor", handle: "@amara_styles", avatar: "AO", followers: 45200, total_views: 892000, total_sales: 12450000, is_verified: true, status: "active", platform: "Instagram" },
  { id: "c2", full_name: "Chidi Eze", handle: "@chidi_tech", avatar: "CE", followers: 28100, total_views: 456000, total_sales: 6780000, is_verified: true, status: "active", platform: "YouTube" },
  { id: "c3", full_name: "Zara Bello", handle: "@zara_beauty", avatar: "ZB", followers: 38400, total_views: 723000, total_sales: 8920000, is_verified: true, status: "active", platform: "Instagram" },
  { id: "c4", full_name: "Tunde Balogun", handle: "@tunde_fitness", avatar: "TB", followers: 19200, total_views: 341000, total_sales: 3450000, is_verified: false, status: "active", platform: "TikTok" },
  { id: "c5", full_name: "Ngozi Obi", handle: "@ngozi_home", avatar: "NO", followers: 15300, total_views: 267000, total_sales: 4560000, is_verified: false, status: "active", platform: "Instagram" },
  { id: "c6", full_name: "Femi Adewale", handle: "@femi_gadgets", avatar: "FA", followers: 22100, total_views: 534000, total_sales: 7230000, is_verified: true, status: "active", platform: "YouTube" },
  { id: "c7", full_name: "Kehinde Yusuf", handle: "@kehinde_fashion", avatar: "KY", followers: 12600, total_views: 198000, total_sales: 2100000, is_verified: false, status: "inactive", platform: "TikTok" },
  { id: "c8", full_name: "Simi Lawal", handle: "@simi_cuisine", avatar: "SL", followers: 31200, total_views: 615000, total_sales: 5340000, is_verified: true, status: "active", platform: "YouTube" },
  { id: "c9", full_name: "Dapo Ogun", handle: "@dapo_travels", avatar: "DO", followers: 9800, total_views: 178000, total_sales: 1890000, is_verified: false, status: "active", platform: "Instagram" },
];

const seedContent: ContentItem[] = [
  { id: "ct1", creator_name: "Amara Okafor", title: "Summer Lookbook 2026", content_type: "video", thumbnail: "🎬", views: 45800, likes: 6200, comments: 340, shoppable: true, products_pinned: [{ product_name: "Summer Dress Floral", clicks: 890, sales: 45 }, { product_name: "Straw Tote Bag", clicks: 456, sales: 28 }] },
  { id: "ct2", creator_name: "Chidi Eze", title: "Hikvision 8MP Review", content_type: "video", thumbnail: "🎬", views: 72300, likes: 8900, comments: 520, shoppable: true, products_pinned: [{ product_name: "Hikvision 8MP Camera", clicks: 2100, sales: 134 }, { product_name: "PoE Switch 8-Port", clicks: 780, sales: 52 }] },
  { id: "ct3", creator_name: "Zara Bello", title: "Glowy Skin Routine", content_type: "reel", thumbnail: "🎥", views: 89100, likes: 12000, comments: 670, shoppable: true, products_pinned: [{ product_name: "Vitamin C Serum", clicks: 1560, sales: 89 }, { product_name: "SPF 50 Sunscreen", clicks: 920, sales: 61 }] },
  { id: "ct4", creator_name: "Tunde Balogun", title: "Home Gym Setup Under ₦200K", content_type: "video", thumbnail: "🎬", views: 34500, likes: 4800, comments: 290, shoppable: true, products_pinned: [{ product_name: "Adjustable Dumbbells", clicks: 670, sales: 38 }, { product_name: "Yoga Mat Premium", clicks: 340, sales: 22 }] },
  { id: "ct5", creator_name: "Ngozi Obi", title: "Living Room Makeover", content_type: "image", thumbnail: "📸", views: 21200, likes: 3400, comments: 180, shoppable: false, products_pinned: [] },
  { id: "ct6", creator_name: "Femi Adewale", title: "Best Laptops for Devs 2026", content_type: "video", thumbnail: "🎬", views: 56700, likes: 7200, comments: 410, shoppable: true, products_pinned: [{ product_name: "MacBook Pro M4", clicks: 1890, sales: 102 }, { product_name: "Dell XPS 16", clicks: 1230, sales: 76 }] },
  { id: "ct7", creator_name: "Kehinde Yusuf", title: "Styling White Sneakers", content_type: "reel", thumbnail: "🎥", views: 18900, likes: 2600, comments: 140, shoppable: false, products_pinned: [] },
  { id: "ct8", creator_name: "Simi Lawal", title: "Nigerian Jollof Recipe", content_type: "video", thumbnail: "🎬", views: 102300, likes: 15400, comments: 890, shoppable: true, products_pinned: [{ product_name: "Non-Stick Pot Set", clicks: 2340, sales: 178 }, { product_name: "Spice Rack 12-Jar", clicks: 1100, sales: 67 }] },
  { id: "ct9", creator_name: "Dapo Ogun", title: "Exploring Obudu Cattle Ranch", content_type: "image", thumbnail: "📸", views: 14200, likes: 2100, comments: 95, shoppable: false, products_pinned: [] },
  { id: "ct10", creator_name: "Amara Okafor", title: "Accessories Haul", content_type: "story", thumbnail: "📱", views: 28400, likes: 3800, comments: 210, shoppable: true, products_pinned: [{ product_name: "Gold Hoop Earrings", clicks: 560, sales: 34 }, { product_name: "Leather Crossbody Bag", clicks: 780, sales: 41 }] },
  { id: "ct11", creator_name: "Zara Bello", title: "Night Skincare Step-by-Step", content_type: "reel", thumbnail: "🎥", views: 62300, likes: 9100, comments: 480, shoppable: true, products_pinned: [{ product_name: "Retinol Night Cream", clicks: 1340, sales: 78 }, { product_name: "Facial Cleansing Brush", clicks: 670, sales: 43 }] },
  { id: "ct12", creator_name: "Chidi Eze", title: "Smart Home Tour", content_type: "video", thumbnail: "🎬", views: 43400, likes: 5600, comments: 320, shoppable: true, products_pinned: [{ product_name: "Smart Speaker Hub", clicks: 980, sales: 55 }, { product_name: "Smart Bulb 4-Pack", clicks: 560, sales: 37 }] },
  { id: "ct13", creator_name: "Femi Adewale", title: "Wireless Earbuds Comparison", content_type: "video", thumbnail: "🎬", views: 39100, likes: 5100, comments: 280, shoppable: true, products_pinned: [{ product_name: "AirPods Pro 2", clicks: 2100, sales: 145 }, { product_name: "Samsung Buds 3 Pro", clicks: 1450, sales: 92 }] },
  { id: "ct14", creator_name: "Simi Lawal", title: "Quick Breakfast Ideas", content_type: "reel", thumbnail: "🎥", views: 76500, likes: 11200, comments: 650, shoppable: false, products_pinned: [] },
  { id: "ct15", creator_name: "Tunde Balogun", title: "30-Day Fitness Progress", content_type: "story", thumbnail: "📱", views: 22100, likes: 3200, comments: 190, shoppable: true, products_pinned: [{ product_name: "Protein Powder 2kg", clicks: 890, sales: 56 }, { product_name: "Resistance Bands Set", clicks: 430, sales: 29 }] },
];

const seedProducts = [
  { id: "sp1", name: "Summer Dress Floral", sku: "SDF-001", price: 25000, category: "Fashion", total_clicks: 1890, total_sales: 89, revenue: "₦2.2M" },
  { id: "sp2", name: "Hikvision 8MP Camera", sku: "HIK-8MP", price: 185000, category: "Electronics", total_clicks: 4200, total_sales: 245, revenue: "₦45.3M" },
  { id: "sp3", name: "Vitamin C Serum", sku: "VCS-001", price: 8500, category: "Beauty", total_clicks: 3100, total_sales: 178, revenue: "₦1.5M" },
  { id: "sp4", name: "Adjustable Dumbbells", sku: "ADB-20", price: 45000, category: "Fitness", total_clicks: 1340, total_sales: 67, revenue: "₦3.0M" },
  { id: "sp5", name: "MacBook Pro M4", sku: "MBP-M4", price: 2450000, category: "Electronics", total_clicks: 3800, total_sales: 198, revenue: "₦485.1M" },
  { id: "sp6", name: "Non-Stick Pot Set", sku: "NPS-005", price: 35000, category: "Home", total_clicks: 4670, total_sales: 312, revenue: "₦10.9M" },
  { id: "sp7", name: "Gold Hoop Earrings", sku: "GHE-012", price: 12000, category: "Fashion", total_clicks: 1120, total_sales: 68, revenue: "₦816K" },
  { id: "sp8", name: "Retinol Night Cream", sku: "RNC-008", price: 15000, category: "Beauty", total_clicks: 2680, total_sales: 145, revenue: "₦2.2M" },
];

const contentIcons: Record<string, React.ElementType> = {
  video: Youtube, image: Camera, reel: Music, story: Instagram,
};

export default function AdminSocialCommercePage() {
  const [activeTab, setActiveTab] = useState("creators");
  const [creators] = useState<Creator[]>(seedCreators);
  const [content] = useState<ContentItem[]>(seedContent);

  const totalViews = content.reduce((s, c) => s + c.views, 0);
  const totalSales = creators.reduce((s, c) => s + c.total_sales, 0);

  return (
    <AdminShell title="Social Commerce" subtitle="Creators, content, and shoppable social media">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-syne font-700 text-2xl text-text-1">Social Commerce</h1>
            <p className="text-sm text-text-3 mt-1">Manage creators, shoppable content, and social product sales</p>
          </div>
          <Button variant="default" size="sm"><Plus className="w-3 h-3 mr-1" /> Add Creator</Button>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6">
          {socialTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-off-white"}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Creators */}
        {activeTab === "creators" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{creators.length}</p>
                <p className="text-xs text-text-3 mt-1">Total Creators</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">{(creators.filter(c => c.status === "active").length)}</p>
                <p className="text-xs text-text-3 mt-1">Active Creators</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{creators.reduce((s, c) => s + c.followers, 0).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Combined Followers</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">₦{Math.round(totalSales / 1000000).toLocaleString()}M</p>
                <p className="text-xs text-text-3 mt-1">Total Social Sales</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-off-white border-b border-border">
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Creator</th>
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Handle</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Followers</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Total Views</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Total Sales</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Verified</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Status</th>
                    <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((cr) => (
                    <tr key={cr.id} className="border-b border-border hover:bg-off-white/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue to-blue-600 flex items-center justify-center text-white text-xs font-bold">{cr.avatar}</div>
                          <span className="text-sm font-medium text-text-1">{cr.full_name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-text-3 font-mono">{cr.handle}</td>
                      <td className="p-3 text-center text-sm text-text-2">{cr.followers.toLocaleString()}</td>
                      <td className="p-3 text-center text-sm text-text-2">{cr.total_views.toLocaleString()}</td>
                      <td className="p-3 text-center font-syne font-600 text-sm text-text-1">₦{Math.round(cr.total_sales / 1000000)}M</td>
                      <td className="p-3 text-center">{cr.is_verified ? <CheckCircle size={14} className="text-blue inline" /> : <XCircle size={14} className="text-text-4 inline" />}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cr.status === "active" ? "bg-green-50 text-success" : "bg-red-50 text-red"}`}>{cr.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Edit className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Feed */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{content.length}</p>
                <p className="text-xs text-text-3 mt-1">Total Content</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Views</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{content.filter(c => c.shoppable).length}</p>
                <p className="text-xs text-text-3 mt-1">Shoppable Items</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">{content.reduce((s, c) => s + c.likes, 0).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Likes</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {content.map((item) => {
                const TypeIcon = contentIcons[item.content_type] || Image;
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl relative">
                      {item.thumbnail === "🎬" || item.thumbnail === "🎥" || item.thumbnail === "📸" || item.thumbnail === "📱" ? <span>{item.thumbnail}</span> : <Image size={32} className="text-text-4" />}
                      {item.shoppable && <span className="absolute top-2 right-2 bg-blue text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Shoppable</span>}
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"><TypeIcon size={10} />{item.content_type}</span>
                    </div>
                    <div className="p-3 space-y-2">
                      <h3 className="text-sm font-medium text-text-1 truncate">{item.title}</h3>
                      <p className="text-xs text-text-4">{item.creator_name}</p>
                      <div className="flex items-center gap-3 text-xs text-text-3">
                        <span className="flex items-center gap-1"><Eye size={12} />{item.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Heart size={12} />{item.likes.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={12} />{item.comments}</span>
                      </div>
                      {item.products_pinned.length > 0 && (
                        <div className="border-t border-border pt-2 mt-2">
                          <p className="text-[10px] text-text-4 font-semibold uppercase mb-1">Pinned Products</p>
                          {item.products_pinned.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-xs py-0.5">
                              <span className="text-text-2">{p.product_name}</span>
                              <span className="text-text-4">{p.clicks} clicks · {p.sales} sales</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{seedProducts.length}</p>
                <p className="text-xs text-text-3 mt-1">Social Products</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">{seedProducts.reduce((s, p) => s + p.total_clicks, 0).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Clicks</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{seedProducts.reduce((s, p) => s + p.total_sales, 0).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Sales</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">{seedProducts.reduce((s, p) => s + p.total_clicks + p.total_sales, 0).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Engagement</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-off-white border-b border-border">
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Product</th>
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">SKU</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Category</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Price</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Clicks</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Sales</th>
                    <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {seedProducts.map((p) => (
                    <tr key={p.id} className="border-b border-border hover:bg-off-white/50">
                      <td className="p-3 text-sm font-medium text-text-1">{p.name}</td>
                      <td className="p-3 text-sm text-text-4 font-mono">{p.sku}</td>
                      <td className="p-3 text-center text-sm text-text-3">{p.category}</td>
                      <td className="p-3 text-center font-syne font-600 text-sm text-text-1">₦{p.price.toLocaleString()}</td>
                      <td className="p-3 text-center text-sm text-text-2">{p.total_clicks.toLocaleString()}</td>
                      <td className="p-3 text-center text-sm text-text-2">{p.total_sales}</td>
                      <td className="p-3 text-right font-syne font-600 text-sm text-text-1">{p.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Content Views</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">₦{Math.round(totalSales / 1000000)}M</p>
                <p className="text-xs text-text-3 mt-1">Revenue via Social</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{Math.round(totalViews / (content.length || 1)).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Avg Views / Content</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">{Math.round(content.reduce((s, c) => s + c.likes, 0) / (content.reduce((s, c) => s + c.views, 0) || 1) * 100)}%</p>
                <p className="text-xs text-text-3 mt-1">Engagement Rate</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-syne font-600 text-sm text-text-1 mb-3 flex items-center gap-2"><Users2 size={16} className="text-blue" /> Top Creators by Views</h3>
                <div className="space-y-2">
                  {[...creators].sort((a, b) => b.total_views - a.total_views).slice(0, 5).map((cr, i) => (
                    <div key={cr.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-4 w-4">{i + 1}</span>
                        <span className="text-sm text-text-1">{cr.full_name}</span>
                      </div>
                      <span className="text-xs text-text-3">{cr.total_views.toLocaleString()} views</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-syne font-600 text-sm text-text-1 mb-3 flex items-center gap-2"><ShoppingBag size={16} className="text-success" /> Best Performing Products</h3>
                <div className="space-y-2">
                  {[...seedProducts].sort((a, b) => b.total_sales - a.total_sales).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-4 w-4">{i + 1}</span>
                        <span className="text-sm text-text-1">{p.name}</span>
                      </div>
                      <span className="text-xs text-success">{p.total_sales} sold</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <BarChart3 className="w-8 h-8 text-blue mx-auto mb-3" />
              <h3 className="font-syne font-700 text-text-1 mb-2">Social Commerce Insights</h3>
              <p className="text-sm text-text-3">Detailed analytics with conversion funnels, creator performance trends, and ROI tracking available in the full report.</p>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
