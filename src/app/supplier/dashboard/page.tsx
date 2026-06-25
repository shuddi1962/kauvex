"use client";

import { Package, Wallet, Bell, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function SupplierDashboardPage() {
  const stats = [
    { label: "Active Products", value: "24", icon: Package, color: "bg-blue-50 text-blue" },
    { label: "Pending Orders", value: "3", icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Completed Orders", value: "156", icon: CheckCircle, color: "bg-green-50 text-green-600" },
    { label: "This Month Earnings", value: "₦245,000", icon: Wallet, color: "bg-purple-50 text-purple-600" },
  ];

  const recentOrders = [
    { id: "KAU-2847", product: "Indomie Chicken Pack", qty: 50, amount: "₦32,500", status: "pending", deadline: "2 hrs" },
    { id: "KAU-2841", product: "Milo Tin 500g", qty: 24, amount: "₦28,800", status: "preparing", deadline: "Today" },
    { id: "KAU-2835", product: "Coke 50cl Crate", qty: 10, amount: "₦15,000", status: "shipped", deadline: "Delivered" },
    { id: "KAU-2829", product: "Peak Milk 400g", qty: 36, amount: "₦54,000", status: "delivered", deadline: "3 days ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Kauvex Supplier Portal</h1>
          <p className="text-sm text-gray-400">Lagos Wholesale Mart</p>
        </div>
        <div className="flex items-center gap-4">
          <Bell size={20} className="text-gray-400" />
          <div className="w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center text-sm font-bold">LW</div>
        </div>
      </div>

      <div className="flex">
        <div className="w-56 bg-white border-r border-gray-200 min-h-screen p-4 space-y-1">
          {[
            { label: "Dashboard", href: "/supplier/dashboard", active: true },
            { label: "Products", href: "/supplier/products" },
            { label: "Orders", href: "/supplier/orders" },
            { label: "Logistics", href: "/supplier/logistics" },
            { label: "Coverage Areas", href: "/supplier/coverage" },
            { label: "Earnings", href: "/supplier/earnings" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`block px-3 py-2 rounded-lg text-sm ${item.active ? 'bg-[#FF6B00] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><Icon size={20} /></div>
                  <p className="text-2xl font-bold text-[#0A1628]">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-[#0A1628]">Recent Orders</h3>
              <Link href="/supplier/orders" className="text-sm text-[#FF6B00] hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map(order => {
                const statusColors: Record<string, string> = {
                  pending: "bg-yellow-100 text-yellow-700",
                  preparing: "bg-blue-100 text-blue-700",
                  shipped: "bg-purple-100 text-purple-700",
                  delivered: "bg-green-100 text-green-700",
                };
                return (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-[#0A1628]">{order.product}</p>
                      <p className="text-sm text-gray-500">{order.id} • Qty: {order.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
