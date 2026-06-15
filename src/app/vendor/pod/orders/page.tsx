"use client";

import Link from "next/link";

export default function PODOrdersPage() {
  const orders = [
    { id: "KAU-4123", product: "Geometric Pattern T-Shirt", design: "Geometric Waves", qty: 2, amount: "₦17,000", status: "processing", partner: "Printful" },
    { id: "KAU-4101", product: "Navy Waves Hoodie", design: "Navy Waves", qty: 1, amount: "₦15,000", status: "shipped", partner: "Printful" },
    { id: "KAU-4087", product: "Minimalist Mug Set", design: "Minimalist Lines", qty: 3, amount: "₦15,000", status: "delivered", partner: "Printify" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-200 p-4 space-y-1 min-h-screen">
        <h2 className="font-bold text-[#0A1628] px-3 mb-4">POD Studio</h2>
        {[
          { label: "Dashboard", href: "/vendor/pod", active: false },
          { label: "Design Studio", href: "/vendor/pod/design-studio", active: false },
          { label: "My Products", href: "/vendor/pod/products", active: false },
          { label: "Orders", href: "/vendor/pod/orders", active: true },
          { label: "Analytics", href: "/vendor/pod/analytics", active: false },
        ].map(l => (
          <Link key={l.label} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${l.active ? 'bg-[#FF6B00] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{l.label}</Link>
        ))}
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-[#0A1628] mb-6">POD Orders</h1>
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Order</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Design</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Qty</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-5 py-3 font-medium">{o.product}</td>
                  <td className="px-5 py-3 text-gray-500">{o.design}</td>
                  <td className="px-5 py-3 text-center">{o.qty}</td>
                  <td className="px-5 py-3 text-right font-semibold">{o.amount}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{o.partner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
