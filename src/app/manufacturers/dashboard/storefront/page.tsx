"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store, ArrowLeft, Save, Upload, Globe, MapPin, Award,
  Clock, Star, Package, Loader2, CheckCircle2, Edit3, Eye
} from "lucide-react";

interface StorefrontData {
  companyName: string;
  slug: string;
  tagline: string;
  description: string;
  country: string;
  city: string;
  yearEstablished: number;
  employeeCount: string;
  factorySize: string;
  website: string;
  specializations: string[];
  certifications: string[];
  responseRate: number;
  avgResponseTime: string;
  totalOrders: number;
  rating: number;
  heroImage: string;
  galleryImages: string[];
}

export default function StorefrontPage() {
  const [data, setData] = useState<StorefrontData>({
    companyName: "",
    slug: "",
    tagline: "",
    description: "",
    country: "",
    city: "",
    yearEstablished: 2020,
    employeeCount: "50-100",
    factorySize: "",
    website: "",
    specializations: [],
    certifications: [],
    responseRate: 0,
    avgResponseTime: "",
    totalOrders: 0,
    rating: 0,
    heroImage: "",
    galleryImages: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "gallery" | "preview">("profile");

  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/dashboard/stats");
        const json = await res.json();
        if (json.data) {
          setData((prev) => ({
            ...prev,
            companyName: json.data.companyName || "Shenzhen Textile Manufacturing Co.",
            slug: json.data.slug || "shenzhen-textile-mfg",
            totalOrders: json.data.activeOrders || 128,
            rating: json.data.rating || 4.7,
            responseRate: json.data.responseRate || 94,
          }));
        }
      } catch {
        setData({
          companyName: "Shenzhen Textile Manufacturing Co.",
          slug: "shenzhen-textile-mfg",
          tagline: "Premium textile manufacturing with 15 years of excellence",
          description: "We specialize in high-quality garment manufacturing, offering end-to-end solutions from fabric sourcing to finished products. Our state-of-the-art facility produces 50,000+ units monthly across cotton, polyester, and blended fabrics.",
          country: "CN",
          city: "Shenzhen",
          yearEstablished: 2011,
          employeeCount: "200-500",
          factorySize: "8,000 sqm",
          website: "https://shenzhentextile.cn",
          specializations: ["Cotton T-Shirts", "Hoodies", "Activewear", "Work Uniforms"],
          certifications: ["ISO 9001", "OEKO-TEX", "BSCI"],
          responseRate: 94,
          avgResponseTime: "2.3 hours",
          totalOrders: 128,
          rating: 4.7,
          heroImage: "",
          galleryImages: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStorefront();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6B00]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={16} className="text-gray-500" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Storefront</h2>
              <p className="text-xs text-gray-500">Manage your public manufacturer profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/manufacturers/${data.slug}`}
              target="_blank"
              className="px-3 py-2 border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Eye size={12} /> View Public Profile
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {(["profile", "gallery", "preview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Store size={15} className="text-[#FF6B00]" /> Company Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Company Name</label>
                    <input
                      value={data.companyName}
                      onChange={(e) => setData({ ...data, companyName: e.target.value })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Profile Slug</label>
                    <div className="flex items-center h-9 px-3 border border-gray-200 rounded-lg bg-gray-50">
                      <span className="text-[10px] text-gray-400 mr-1">kauvex.com/manufacturers/</span>
                      <input
                        value={data.slug}
                        onChange={(e) => setData({ ...data, slug: e.target.value })}
                        className="flex-1 bg-transparent text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Tagline</label>
                    <input
                      value={data.tagline}
                      onChange={(e) => setData({ ...data, tagline: e.target.value })}
                      placeholder="e.g. Premium textile manufacturing with 15 years of excellence"
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Description</label>
                    <textarea
                      value={data.description}
                      onChange={(e) => setData({ ...data, description: e.target.value })}
                      rows={4}
                      placeholder="Describe your manufacturing capabilities, specialties, and what sets you apart..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <MapPin size={15} className="text-[#FF6B00]" /> Location & Details
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Country</label>
                    <select
                      value={data.country}
                      onChange={(e) => setData({ ...data, country: e.target.value })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    >
                      <option value="CN">China</option>
                      <option value="NG">Nigeria</option>
                      <option value="IN">India</option>
                      <option value="VN">Vietnam</option>
                      <option value="BD">Bangladesh</option>
                      <option value="TR">Turkey</option>
                      <option value="PK">Pakistan</option>
                      <option value="EG">Egypt</option>
                      <option value="ET">Ethiopia</option>
                      <option value="MX">Mexico</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="PL">Poland</option>
                      <option value="RO">Romania</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">City</label>
                    <input
                      value={data.city}
                      onChange={(e) => setData({ ...data, city: e.target.value })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Website</label>
                    <input
                      value={data.website}
                      onChange={(e) => setData({ ...data, website: e.target.value })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Year Established</label>
                    <input
                      type="number"
                      value={data.yearEstablished}
                      onChange={(e) => setData({ ...data, yearEstablished: parseInt(e.target.value) })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Employees</label>
                    <select
                      value={data.employeeCount}
                      onChange={(e) => setData({ ...data, employeeCount: e.target.value })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    >
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="50-100">50-100</option>
                      <option value="100-200">100-200</option>
                      <option value="200-500">200-500</option>
                      <option value="500-1000">500-1,000</option>
                      <option value="1000+">1,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Factory Size (sqm)</label>
                    <input
                      value={data.factorySize}
                      onChange={(e) => setData({ ...data, factorySize: e.target.value })}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4">Profile Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Response Rate</span>
                    <span className="text-sm font-bold text-[#0A1628]">{data.responseRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.responseRate}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Avg Response Time</span>
                    <span className="text-sm font-bold text-[#0A1628]">{data.avgResponseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Orders</span>
                    <span className="text-sm font-bold text-[#0A1628]">{data.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Rating</span>
                    <span className="text-sm font-bold text-[#0A1628] flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" /> {data.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-1.5">
                  {data.specializations.map((spec) => (
                    <span key={spec} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">{spec}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-3">Certifications</h3>
                <div className="flex flex-wrap gap-1.5">
                  {data.certifications.map((cert) => (
                    <span key={cert} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-medium flex items-center gap-1">
                      <Award size={9} /> {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <Upload size={15} className="text-[#FF6B00]" /> Factory Gallery
            </h3>
            <p className="text-xs text-gray-500 mb-4">Upload photos and videos of your factory. Minimum 5 photos recommended for higher trust scores.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-[#FF6B00] hover:bg-[#FF6B00]/5 transition-colors cursor-pointer group">
                  {i <= 3 ? (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Package size={24} className="text-gray-300 group-hover:text-[#FF6B00]" />
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-gray-300 group-hover:text-[#FF6B00] mb-1" />
                      <span className="text-[10px] text-gray-400 group-hover:text-[#FF6B00]">
                        {i === 4 ? "Add Photo" : i === 5 ? "Add Video" : "Add Media"}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4">Public Profile Preview</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-40 bg-gradient-to-r from-[#0A1628] to-[#1a2a4a] flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-xl font-bold">{data.companyName}</h2>
                  <p className="text-sm text-white/60 mt-1 flex items-center justify-center gap-1">
                    <MapPin size={12} /> {data.city}, {data.country} &bull; Est. {data.yearEstablished}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-600 leading-relaxed">{data.description}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star size={12} className="text-amber-500 fill-amber-500" /> {data.rating} rating
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} /> {data.avgResponseTime} response
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Package size={12} /> {data.totalOrders} orders
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Globe size={12} /> {data.responseRate}% response rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
