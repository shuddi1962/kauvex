"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Package,
  CreditCard,
  Tag,
  AlertCircle,
  Truck,
  Gift,
  Star,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof Truck;
}

const iconMap: Record<string, typeof Truck> = {
  order: Package, promo: Tag, payment: CreditCard, loyalty: Star, alert: AlertCircle, truck: Truck, gift: Gift,
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/account/notifications");
        if (res.ok) {
          const d = await res.json();
          const arr = Array.isArray(d) ? d : d.notifications || [];
          setNotifications(
            arr.map((n: Record<string, unknown>) => ({
              ...n,
              icon: iconMap[n.type as string] || Bell,
            }))
          );
        }
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const markAllRead = async () => {
    setActing(true);
    try {
      await fetch("/api/v1/account/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setActing(false);
    }
  };

  const clearAll = async () => {
    setActing(true);
    try {
      await fetch("/api/v1/account/notifications", { method: "DELETE" });
      setNotifications([]);
    } finally {
      setActing(false);
    }
  };

  const toggleRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
    try {
      await fetch("/api/v1/account/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    } catch {
      // revert on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = filter === "all" ? notifications :
    filter === "unread" ? notifications.filter((n) => !n.read) :
    notifications.filter((n) => n.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-text-1">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-3 mt-1">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={markAllRead} disabled={acting}>
            {acting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Mark All Read
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-red hover:bg-red-50" onClick={clearAll} disabled={acting}>
            <Trash2 size={14} /> Clear All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {[
          { id: "all", label: "All" },
          { id: "unread", label: "Unread" },
          { id: "order", label: "Orders" },
          { id: "promo", label: "Promotions" },
          { id: "payment", label: "Payments" },
          { id: "alert", label: "Alerts" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id
                ? "bg-blue text-white"
                : "bg-white text-text-3 border border-border hover:bg-off-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              onClick={() => toggleRead(notif.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                notif.read
                  ? "bg-white border-border hover:bg-off-white"
                  : "bg-blue-50/50 border-blue/20 hover:bg-blue-50"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                notif.read ? "bg-off-white" : "bg-blue/10"
              }`}>
                <Icon size={18} className={notif.read ? "text-text-4" : "text-blue"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${notif.read ? "text-text-2" : "text-text-1"}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue shrink-0" />
                  )}
                </div>
                <p className="text-xs text-text-3 mt-0.5">{notif.message}</p>
                <p className="text-[11px] text-text-4 mt-1">{notif.time}</p>
              </div>
              <button className="text-text-4 hover:text-red transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-text-4 mb-3" />
          <p className="text-text-3 font-medium">No notifications</p>
          <p className="text-sm text-text-4 mt-1">You&apos;re all caught up!</p>
        </div>
      )}
    </div>
  );
}
