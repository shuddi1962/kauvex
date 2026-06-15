"use client";

export default function SupplierEarningsPage() {
  const payouts = [
    { period: "Jun 1-15, 2026", gross: "₦320,000", commission: "₦25,600", net: "₦294,400", status: "paid", date: "Jun 16" },
    { period: "May 16-31, 2026", gross: "₦285,000", commission: "₦22,800", net: "₦262,200", status: "paid", date: "Jun 1" },
    { period: "May 1-15, 2026", gross: "₦410,000", commission: "₦32,800", net: "₦377,200", status: "paid", date: "May 16" },
    { period: "Apr 16-30, 2026", gross: "₦198,000", commission: "₦15,840", net: "₦182,160", status: "paid", date: "May 1" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-6 py-4">
        <h1 className="text-xl font-bold">Kauvex Supplier Portal</h1>
        <p className="text-sm text-gray-400">Lagos Wholesale Mart</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "This Month", value: "₦320,000" },
            { label: "Pending Payout", value: "₦294,400" },
            { label: "Total Earned", value: "₦1,115,960" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#0A1628]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-[#0A1628]">Payout History</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Period</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Gross Sales</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Commission (8%)</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Net Amount</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map(p => (
                <tr key={p.period} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{p.period}</td>
                  <td className="px-5 py-3 text-right">{p.gross}</td>
                  <td className="px-5 py-3 text-right text-gray-500">{p.commission}</td>
                  <td className="px-5 py-3 text-right font-semibold">{p.net}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{p.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-500">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
