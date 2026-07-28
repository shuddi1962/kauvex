import Link from "next/link";
import { MessageSquare, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, string> = {
  rocket: "🚀",
  package: "📦",
  "trending-up": "📈",
  truck: "🚛",
  "credit-card": "💳",
  lightbulb: "💡",
};

async function getData() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [catRes, topRes] = await Promise.all([
    fetch(`${base}/api/v1/community/categories`, { cache: "no-store" }),
    fetch(`${base}/api/v1/community/topics?limit=10`, { cache: "no-store" }),
  ]);
  const categories = catRes.ok ? (await catRes.json()).data || [] : [];
  const topics = topRes.ok ? (await topRes.json()).data || [] : [];
  return { categories, topics };
}

export default async function CommunityPage() {
  const { categories, topics } = await getData();

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0A1628] to-[#1a2a4a] rounded-2xl p-8 md:p-12 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Vendor Community</h1>
        <p className="text-gray-300 text-lg max-w-2xl mb-6">
          Connect with fellow sellers, share tips, and grow your business on Kauvex.
        </p>
        <div className="flex gap-3">
          <Link href="/community/topics/new">
            <Button className="bg-[#FF6B00] hover:bg-[#e06000] text-white gap-2">
              <Plus size={18} /> New Topic
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search topics..."
          className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
        />
      </div>

      {/* Categories Grid */}
      <h2 className="text-xl font-bold text-[#0A1628] mb-4">Categories</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {categories.map((cat: any) => (
          <Link
            key={cat.id}
            href={`/community/category/${cat.slug}`}
            className="bg-white rounded-xl border border-border p-5 hover:shadow-soft hover:border-[#FF6B00]/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {iconMap[cat.icon] || "💬"}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                <p className="text-xs text-gray-400 mt-2">{cat.topicCount || 0} topics</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Topics */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#0A1628]">Recent Topics</h2>
        <Link href="/community/category/getting-started" className="text-sm text-[#FF6B00] font-medium hover:underline">
          View all
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border divide-y divide-border">
        {topics.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No topics yet. Be the first to start a conversation!</p>
          </div>
        ) : (
          topics.map((topic: any) => (
            <Link
              key={topic.id}
              href={`/community/topics/${topic.id}`}
              className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {topic.is_pinned && <span className="text-xs bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-0.5 rounded-full font-medium">Pinned</span>}
                  {topic.is_locked && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Locked</span>}
                  <h3 className="font-medium text-[#0A1628] truncate">{topic.title}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{topic.body?.replace(/<[^>]+>/g, "").slice(0, 150)}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>by {topic.author?.full_name || "Unknown"}</span>
                  <span>{topic.reply_count || 0} replies</span>
                  <span>{topic.view_count || 0} views</span>
                  <span>{topic.last_activity_at ? new Date(topic.last_activity_at).toLocaleDateString() : ""}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}