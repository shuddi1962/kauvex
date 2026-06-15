"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, CreditCard, Megaphone, Palette,
  Globe, Truck, Settings, Search, Bell, ChevronDown, ChevronLeft,
  Menu, ArrowLeft, BarChart3, FolderTree, ShoppingCart, Users,
  Image,   Layers, Shield, Store, Warehouse, MapPin, Plug, Heart,
  Gift, Ticket, Scale, PenTool, Smartphone, ScrollText, FileText,
  Tag, Award, SlidersHorizontal, Navigation, Anchor, UserPlus,
  Wrench, ClipboardList, ImageIcon, Sparkles, ChevronRight, Star,
  RefreshCw, UserCog, MapPinOff, Building2, Handshake, Radio,
  Gavel, Repeat, Download, Bot, MessageCircle, Languages,
  TrendingUp, Scan, QrCode, ExternalLink, LogOut,
} from "lucide-react";
import { AdminStorefrontFilter } from "@/components/admin/storefront-filter";
import { useAuthStore } from "@/store/auth-store";

type SectionKey = "dashboard" | "commerce" | "sales" | "marketing" | "content" | "marketplace" | "operations" | "system";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const topNavSections: { key: SectionKey; label: string; icon: React.ElementType; groups: NavGroup[] }[] = [
  {
    key: "dashboard", label: "Dashboard", icon: LayoutDashboard,
    groups: [
      { title: "Overview", items: [
        { label: "Dashboard", href: "/admin" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Reports", href: "/admin/reports" },
      ]},
    ],
  },
  {
    key: "commerce", label: "Commerce", icon: Package,
    groups: [
      { title: "Catalog", items: [
        { label: "All Products", href: "/admin/products" },
        { label: "Add Product", href: "/admin/products/create" },
        { label: "Categories", href: "/admin/categories" },
        { label: "Brands", href: "/admin/brands" },
        { label: "Tags", href: "/admin/tags" },
        { label: "Variations", href: "/admin/variations" },
        { label: "Bundles", href: "/admin/bundles" },
        { label: "Digital Products", href: "/admin/digital-products" },
        { label: "Storefront Assignment", href: "/admin/product-storefronts", badge: "New" },
      ]},
      { title: "Enterprise", items: [
        { label: "ERP Dashboard", href: "/admin/erp" },
        { label: "Procurement", href: "/admin/procurement" },
        { label: "RFQ System", href: "/admin/rfq" },
      ]},
      { title: "Orders", items: [
        { label: "All Orders", href: "/admin/orders" },
        { label: "Disputes", href: "/admin/disputes" },
        { label: "Quotes", href: "/admin/quotes" },
        { label: "Bookings", href: "/admin/bookings" },
        { label: "Subscriptions", href: "/admin/subscriptions" },
      ]},
      { title: "Customers", items: [
        { label: "All Customers", href: "/admin/customers" },
        { label: "CRM Pipeline", href: "/admin/crm" },
        { label: "Gift Cards", href: "/admin/gift-cards" },
        { label: "Coupons", href: "/admin/coupons" },
      ]},
      { title: "Reviews", items: [
        { label: "Product Reviews", href: "/admin/reviews" },
      ]},
    ],
  },
  {
    key: "sales", label: "Sales", icon: CreditCard,
    groups: [
      { title: "Sales", items: [
        { label: "Orders", href: "/admin/orders" },
        { label: "POS", href: "/admin/pos" },
        { label: "Quotes", href: "/admin/quotes" },
        { label: "Bookings", href: "/admin/bookings" },
      ]},
      { title: "Finance", items: [
        { label: "Payments & P&L", href: "/admin/finance" },
        { label: "BNPL", href: "/admin/bnpl" },
        { label: "Vendor Financing", href: "/admin/financing" },
        { label: "Insurance", href: "/admin/insurance" },
        { label: "Credit System", href: "/admin/credit" },
      ]},
    ],
  },
  {
    key: "marketing", label: "Marketing", icon: Megaphone,
    groups: [
      { title: "Campaigns", items: [
        { label: "Marketing", href: "/admin/marketing" },
        { label: "Email Marketing", href: "/admin/email-marketing" },
        { label: "Advertising", href: "/admin/advertising" },
        { label: "Affiliates", href: "/admin/affiliates" },
        { label: "Banners", href: "/admin/banners" },
        { label: "Popups & Ads", href: "/admin/popups" },
      ]},
      { title: "Social", items: [
        { label: "Social Commerce", href: "/admin/social-commerce" },
        { label: "Live Shopping", href: "/admin/live-shopping" },
      ]},
      { title: "SEO", items: [
        { label: "SEO Tools", href: "/admin/seo" },
      ]},
    ],
  },
  {
    key: "content", label: "Content", icon: Palette,
    groups: [
      { title: "Design", items: [
        { label: "Homepage Builder", href: "/admin/homepage" },
        { label: "Page Editor", href: "/admin/page-editor" },
        { label: "Menu Builder", href: "/admin/menu" },
        { label: "Banner Builder", href: "/admin/banners/builder" },
        { label: "Footer Builder", href: "/admin/footer" },
      ]},
      { title: "Media", items: [
        { label: "Media Library", href: "/admin/media" },
        { label: "Pages", href: "/admin/pages" },
      ]},
    ],
  },
  {
    key: "marketplace", label: "Marketplace", icon: Globe,
    groups: [
      { title: "Storefronts", items: [
        { label: "All Storefronts", href: "/admin/storefronts" },
        { label: "Create Storefront", href: "/admin/storefronts/create", badge: "New" },
      ]},
      { title: "Vendors", items: [
        { label: "All Vendors", href: "/admin/vendors" },
        { label: "Vendor Ads", href: "/admin/vendor-ads" },
        { label: "Reputation", href: "/admin/reputation" },
        { label: "Authenticity", href: "/admin/authenticity" },
      ]},
      { title: "Partner Network", items: [
        { label: "Suppliers", href: "/admin/suppliers" },
        { label: "Franchise", href: "/admin/franchise" },
        { label: "Auctions", href: "/admin/auctions" },
      ]},
      { title: "Fulfillment", items: [
        { label: "FBK Management", href: "/admin/fbk" },
        { label: "Boat Configurator", href: "/admin/boat-configurator" },
      ]},
    ],
  },
  {
    key: "operations", label: "Operations", icon: Truck,
    groups: [
      { title: "Logistics", items: [
        { label: "Delivery", href: "/admin/delivery" },
        { label: "Drivers", href: "/admin/drivers" },
        { label: "Shipping Zones", href: "/admin/shipping" },
        { label: "Shipping Carriers", href: "/admin/shipping-carriers" },
        { label: "Returns", href: "/admin/returns" },
      ]},
      { title: "Warehouse", items: [
        { label: "Locations", href: "/admin/locations" },
        { label: "Warehouses", href: "/admin/warehouses" },
        { label: "Inventory", href: "/admin/inventory" },
        { label: "Pickup Points", href: "/admin/pickup-points" },
        { label: "Drop-off Zones", href: "/admin/dropoff-zones" },
      ]},
      { title: "Services", items: [
        { label: "Warranty", href: "/admin/warranty" },
        { label: "Field Team", href: "/admin/field-team" },
        { label: "CJ Dropshipping", href: "/admin/cj-dropshipping" },
        { label: "Forecasting", href: "/admin/forecasting" },
        { label: "Fraud Detection", href: "/admin/fraud" },
      ]},
    ],
  },
  {
    key: "system", label: "System", icon: Settings,
    groups: [
      { title: "Configuration", items: [
        { label: "General Settings", href: "/admin/settings" },
        { label: "Staff", href: "/admin/staff" },
        { label: "Roles & Permissions", href: "/admin/roles" },
        { label: "Feature Flags", href: "/admin/features" },
        { label: "Languages", href: "/admin/languages" },
      ]},
      { title: "Tools", items: [
        { label: "Mobile App", href: "/admin/mobile" },
        { label: "Site Doctor", href: "/admin/site-doctor" },
        { label: "Audit Log", href: "/admin/audit-log" },
        { label: "AI Tools", href: "/admin/ai" },
        { label: "AI Assistant", href: "/admin/ai-assistant" },
        { label: "Chat System", href: "/admin/chat" },
      ]},
      { title: "Developers", items: [
        { label: "API Docs", href: "/api/docs" },
        { label: "API Keys", href: "/admin/api-keys" },
        { label: "Webhooks", href: "/admin/webhooks" },
        { label: "White Label", href: "/admin/white-label" },
      ]},
    ],
  },
];

function detectSection(pathname: string): SectionKey {
  if (pathname === "/admin" || pathname.startsWith("/admin/analytics") || pathname.startsWith("/admin/reports")) return "dashboard";
  if (pathname.startsWith("/admin/products") || pathname.startsWith("/admin/product-storefronts") || pathname.startsWith("/admin/categories") || pathname.startsWith("/admin/brands") || pathname.startsWith("/admin/tags") || pathname.startsWith("/admin/variations") || pathname.startsWith("/admin/bundles") || pathname.startsWith("/admin/orders") || pathname.startsWith("/admin/customers") || pathname.startsWith("/admin/crm") || pathname.startsWith("/admin/gift-cards") || pathname.startsWith("/admin/coupons") || pathname.startsWith("/admin/disputes") || pathname.startsWith("/admin/reviews") || pathname.startsWith("/admin/inventory") || pathname.startsWith("/admin/quotes") || pathname.startsWith("/admin/bookings") || pathname.startsWith("/admin/erp") || pathname.startsWith("/admin/procurement") || pathname.startsWith("/admin/rfq") || pathname.startsWith("/admin/digital-products") || pathname.startsWith("/admin/subscriptions")) return "commerce";
  if (pathname.startsWith("/admin/pos") || pathname.startsWith("/admin/finance") || pathname.startsWith("/admin/bnpl") || pathname.startsWith("/admin/financing") || pathname.startsWith("/admin/insurance") || pathname.startsWith("/admin/credit")) return "sales";
  if (pathname.startsWith("/admin/marketing") || pathname.startsWith("/admin/email-marketing") || pathname.startsWith("/admin/advertising") || pathname.startsWith("/admin/banners") || pathname.startsWith("/admin/popups") || pathname.startsWith("/admin/seo") || pathname.startsWith("/admin/affiliates") || pathname.startsWith("/admin/social-commerce") || pathname.startsWith("/admin/live-shopping")) return "marketing";
  if (pathname.startsWith("/admin/homepage") || pathname.startsWith("/admin/page-editor") || pathname.startsWith("/admin/menu") || pathname.startsWith("/admin/footer") || pathname.startsWith("/admin/media") || pathname.startsWith("/admin/pages")) return "content";
  if (pathname.startsWith("/admin/storefronts") || pathname.startsWith("/admin/vendors") || pathname.startsWith("/admin/vendor-ads") || pathname.startsWith("/admin/fbk") || pathname.startsWith("/admin/boat-configurator") || pathname.startsWith("/admin/reputation") || pathname.startsWith("/admin/authenticity") || pathname.startsWith("/admin/suppliers") || pathname.startsWith("/admin/franchise") || pathname.startsWith("/admin/auctions")) return "marketplace";
  if (pathname.startsWith("/admin/delivery") || pathname.startsWith("/admin/drivers") || pathname.startsWith("/admin/returns") || pathname.startsWith("/admin/shipping") || pathname.startsWith("/admin/shipping-carriers") || pathname.startsWith("/admin/locations") || pathname.startsWith("/admin/warehouses") || pathname.startsWith("/admin/pickup-points") || pathname.startsWith("/admin/dropoff-zones") || pathname.startsWith("/admin/warranty") || pathname.startsWith("/admin/field-team") || pathname.startsWith("/admin/cj-dropshipping") || pathname.startsWith("/admin/forecasting") || pathname.startsWith("/admin/fraud")) return "operations";
  if (pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/staff") || pathname.startsWith("/admin/roles") || pathname.startsWith("/admin/features") || pathname.startsWith("/admin/mobile") || pathname.startsWith("/admin/site-doctor") || pathname.startsWith("/admin/audit-log") || pathname.startsWith("/admin/ai") || pathname.startsWith("/admin/api-keys") || pathname.startsWith("/admin/webhooks") || pathname.startsWith("/admin/white-label") || pathname.startsWith("/admin/languages") || pathname.startsWith("/admin/ai-assistant") || pathname.startsWith("/admin/chat") || pathname.startsWith("/api/docs")) return "system";
  return "dashboard";
}

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminShell({ children, title, subtitle }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [manualSection, setManualSection] = useState<SectionKey | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuthStore();

  const activeSection = manualSection || detectSection(pathname);
  const currentSection = topNavSections.find(s => s.key === activeSection);

  useEffect(() => {
    setManualSection(null);
  }, [pathname]);

  const isActiveLink = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* ===== TOP NAV BAR ===== */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-navy text-white z-40 flex items-center px-3 gap-1 shadow-lg">
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg">
          <Menu size={18} />
        </button>

        <Link href="/admin" className="flex items-center gap-2 px-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange to-orange/80 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">K</span>
          </div>
          <span className="font-bold text-sm tracking-tight hidden sm:block">KAUVEX</span>
          <span className="text-[9px] text-orange font-medium bg-white/10 px-1.5 py-0.5 rounded hidden md:block">Admin</span>
        </Link>

        <div className="flex-1 flex items-center gap-0.5 overflow-visible">
          {topNavSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                onClick={() => {
                  setManualSection(sec.key);
                  setSidebarOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{sec.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <AdminStorefrontFilter />

          {/* Search */}
          <div ref={searchRef} className="relative hidden md:block">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/admin?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              placeholder="Search..."
              className="w-36 h-8 bg-white/10 rounded-lg pl-8 pr-2.5 text-xs text-white placeholder:text-white/30 border border-white/10 focus:outline-none focus:border-white/30"
            />
          </div>

          {/* Notifications */}
          <Link href="/admin/settings" className="relative p-1.5 hover:bg-white/10 rounded-lg">
            <Bell size={15} className="text-white/60" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-orange rounded-full" />
          </Link>

          {/* Profile */}
          <Link href="/admin/settings" className="flex items-center gap-2 pl-2 ml-1 border-l border-white/10 hover:bg-white/10 rounded-lg py-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue to-blue-600 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "SA"}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-[11px] font-semibold text-white leading-tight">{user?.name || "Super Admin"}</p>
            </div>
          </Link>

          <button
            onClick={() => signOut()}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* ===== LAYOUT: sidebar + main ===== */}
      <div className="flex flex-1 pt-14 min-h-0">
        {/* ===== LEFT SIDEBAR (compact, collapsed by default) ===== */}
        <aside className={`${
          sidebarOpen ? "w-[200px]" : "w-0 lg:w-[48px]"
        } bg-white border-r border-border shrink-0 overflow-y-auto transition-all duration-200 ${
          mobileNavOpen ? "fixed left-0 top-14 bottom-0 z-30 w-[220px]" : "hidden lg:block"
        }`}>
          <div className={`flex items-center ${sidebarOpen ? "justify-between px-3" : "justify-center"} h-10 border-b border-border`}>
            {sidebarOpen && (
              <span className="text-[9px] font-semibold text-text-4 uppercase tracking-wider">
                {currentSection?.label || ""}
              </span>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={12} className={`text-text-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          <nav className="py-2 px-1.5 space-y-3">
            {currentSection?.groups.map((group) => (
              <div key={group.title}>
                {sidebarOpen && (
                  <p className="px-2 mb-0.5 text-[9px] text-text-4 uppercase tracking-wider font-semibold">{group.title}</p>
                )}
                {group.items.slice(0, sidebarOpen ? undefined : 1).map((item) => {
                  const active = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        active
                          ? "bg-orange-50 text-orange font-semibold"
                          : "text-text-3 hover:bg-gray-50 hover:text-text-1"
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      {!sidebarOpen && (
                        <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-orange" : "bg-text-4"}`} />
                      )}
                      {sidebarOpen && <span>{item.label}</span>}
                      {sidebarOpen && item.badge && (
                        <span className="ml-auto text-[8px] bg-orange text-white px-1 py-0.5 rounded-full font-bold">{item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-border px-6 py-3 flex items-center gap-3 shrink-0">
            <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg text-text-4">
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="font-bold text-base text-text-1 leading-tight">{title}</h1>
              {subtitle && <p className="text-[11px] text-text-4 -mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
