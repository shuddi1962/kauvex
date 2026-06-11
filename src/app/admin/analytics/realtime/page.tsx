"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip } from "recharts";
import { Users, ShoppingCart, DollarSign, Clock, Activity, ArrowUpRight } from "lucide-react";

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 20;
    const increment = (value - display) / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplay((prev) => Math.round(prev + increment));
      if (step >= steps) {
        setDisplay(value);
        clearInterval(interval);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

const sparklineData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  visitors: Math.floor(Math.random() * 80) + 20,
  orders: Math.floor(Math.random() * 15) + 1,
  revenue: Math.floor(Math.random() * 5000) + 500,
}));

export default function RealtimeAnalyticsPage() {
  const [visitors, setVisitors] = useState(42);
  const [ordersLastHour, setOrdersLastHour] = useState(7);
  const [revenueLastHour, setRevenueLastHour] = useState(12450);
  const [cartSessions, setCartSessions] = useState(13);
  const [recentOrders, setRecentOrders] = useState<{ id: string; customer: string; product: string; amount: number; time: string }[]>([]);
  const [history, setHistory] = useState(sparklineData);

  const generateOrder = useCallback(() => {
    const names = ["Chidi O.", "Amina B.", "Emeka N.", "Zainab K.", "Tunde A.", "Fatima S.", "Kelechi M.", "Ngozi E."];
    const products = ["Hikvision 4CH DVR Kit", "Yamaha 40HP Outboard", "Access Control System", "Fire Alarm Panel", "Life Jacket Adult", "Solar Panel 200W", "Deep Cycle Battery", "LED Floodlight 50W"];
    return {
      id: `ORD-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      customer: names[Math.floor(Math.random() * names.length)],
      product: products[Math.floor(Math.random() * products.length)],
      amount: Math.floor(Math.random() * 150000) + 5000,
      time: new Date().toLocaleTimeString(),
    };
  }, []);

  useEffect(() => {
    const int1 = setInterval(() => {
      setVisitors((prev) => Math.max(5, prev + Math.floor(Math.random() * 10) - 4));
      setOrdersLastHour((prev) => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      setRevenueLastHour((prev) => Math.max(0, prev + Math.floor(Math.random() * 2000) - 500));
      setCartSessions((prev) => Math.max(0, prev + Math.floor(Math.random() * 5) - 2));
    }, 3000);

    const int2 = setInterval(() => {
      setRecentOrders((prev) => {
        const next = [generateOrder(), ...prev];
        return next.slice(0, 10);
      });
    }, 10000);

    const int3 = setInterval(() => {
      setHistory((prev) => {
        const next = [...prev.slice(1), {
          time: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}`,
          visitors: Math.floor(Math.random() * 80) + 20,
          orders: Math.floor(Math.random() * 15) + 1,
          revenue: Math.floor(Math.random() * 5000) + 500,
        }];
        return next;
      });
    }, 5000);

    const seed = Array.from({ length: 10 }, () => generateOrder());
    setRecentOrders(seed);

    return () => { clearInterval(int1); clearInterval(int2); clearInterval(int3); };
  }, [generateOrder]);

  const kpis = [
    { label: "Live Visitors", value: visitors, icon: Users, color: "text-blue", bg: "bg-blue/10" },
    { label: "Orders (60m)", value: ordersLastHour, icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
    { label: "Revenue (60m)", value: revenueLastHour, icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-50", prefix: "₦" },
    { label: "Active Carts", value: cartSessions, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <AdminShell title="Real-time Analytics" subtitle="Live store activity and performance metrics">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-text-4 font-medium">Live — updating every 3s</span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                    <Icon size={16} className={kpi.color} />
                  </div>
                  <span className="text-[10px] text-text-4">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold text-text-1">
                  <AnimatedNumber value={kpi.value} prefix={kpi.prefix || ""} />
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Sparkline Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-4">Visitors (24h)</span>
              <Users size={14} className="text-blue" />
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="visitors" stroke="#3B82F6" fill="url(#visitorGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-4">Orders (24h)</span>
              <ShoppingCart size={14} className="text-green-600" />
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="orders" stroke="#22C55E" fill="url(#orderGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-4">Revenue (24h)</span>
              <DollarSign size={14} className="text-yellow-600" />
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EAB308" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#EAB308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="revenue" stroke="#EAB308" fill="url(#revGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Feed */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Clock size={14} className="text-blue" />
              Recent Orders
            </h3>
            <span className="text-[10px] text-text-4">Auto-updates every 10s</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
                    <ShoppingCart size={12} className="text-blue" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-1 truncate">{order.customer}</p>
                    <p className="text-xs text-text-4 truncate">{order.product}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold text-text-1">₦{order.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-text-4">{order.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
