import Link from "next/link";
import { MessageSquare, Home, Plus, ChevronRight } from "lucide-react";

const sidebarLinks = [
  { label: "All Categories", href: "/community", icon: Home },
  { label: "Getting Started", href: "/community/category/getting-started", icon: MessageSquare },
  { label: "Product & Listings", href: "/community/category/product-listings", icon: MessageSquare },
  { label: "Marketing & Growth", href: "/community/category/marketing-growth", icon: MessageSquare },
  { label: "Shipping & Fulfillment", href: "/community/category/shipping-fulfillment", icon: MessageSquare },
  { label: "Kauvex Pay & Finances", href: "/community/category/kauvex-pay-finances", icon: MessageSquare },
  { label: "Feedback & Ideas", href: "/community/category/feedback-ideas", icon: MessageSquare },
];

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-bold text-[#0A1628] flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#FF6B00]" />
                  Community
                </h2>
              </div>
              <nav className="p-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-[#0A1628] hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Icon size={16} className="text-gray-400" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-border">
                <Link
                  href="/community/topics/new"
                  className="flex items-center justify-center gap-2 w-full h-10 bg-[#FF6B00] hover:bg-[#e06000] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus size={16} /> New Topic
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}