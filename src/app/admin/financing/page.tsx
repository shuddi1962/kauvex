"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  DollarSign, Search, Eye, TrendingUp, CreditCard,
  AlertTriangle, X, Check, Clock, Banknote, BarChart3,
  Building2, Store, TrendingUp as TrendUp,
} from "lucide-react";

interface FinancingApp {
  id: string;
  vendor: string;
  vendor_id: string;
  loan_type: string;
  requested_amount: number;
  approved_amount: number | null;
  term_months: number;
  interest_rate: number;
  status: string;
  applied_date: string;
  monthly_sales: number;
  return_rate: number;
  rating: number;
  delivery_performance: number;
}

const loanTypes = ["Inventory Loan", "Advertising Credit", "Store Growth", "Fulfillment Credit"];

const applications: FinancingApp[] = [
  { id: "1", vendor: "Coastal Marine Ltd", vendor_id: "V001", loan_type: "Inventory Loan", requested_amount: 5000000, approved_amount: null, term_months: 12, interest_rate: 15, status: "under_review", applied_date: "2026-06-01", monthly_sales: 4200000, return_rate: 2.1, rating: 4.5, delivery_performance: 96 },
  { id: "2", vendor: "Lagos Tech Hub", vendor_id: "V002", loan_type: "Advertising Credit", requested_amount: 1500000, approved_amount: 1200000, term_months: 6, interest_rate: 18, status: "approved", applied_date: "2026-05-15", monthly_sales: 1800000, return_rate: 3.5, rating: 4.2, delivery_performance: 94 },
  { id: "3", vendor: "Green Fields Agro", vendor_id: "V003", loan_type: "Store Growth", requested_amount: 8000000, approved_amount: null, term_months: 24, interest_rate: 12, status: "submitted", applied_date: "2026-06-10", monthly_sales: 6900000, return_rate: 1.8, rating: 4.8, delivery_performance: 99 },
  { id: "4", vendor: "Swift Logistics NG", vendor_id: "V004", loan_type: "Fulfillment Credit", requested_amount: 3000000, approved_amount: 3000000, term_months: 9, interest_rate: 14, status: "disbursed", applied_date: "2026-04-20", monthly_sales: 5100000, return_rate: 2.5, rating: 4.0, delivery_performance: 91 },
  { id: "5", vendor: "ElectroMart Africa", vendor_id: "V005", loan_type: "Inventory Loan", requested_amount: 6000000, approved_amount: null, term_months: 12, interest_rate: 15, status: "draft", applied_date: "2026-06-12", monthly_sales: 3500000, return_rate: 4.2, rating: 3.8, delivery_performance: 88 },
  { id: "6", vendor: "Fashion House Abuja", vendor_id: "V006", loan_type: "Advertising Credit", requested_amount: 900000, approved_amount: 900000, term_months: 3, interest_rate: 20, status: "disbursed", applied_date: "2026-03-01", monthly_sales: 1100000, return_rate: 5.0, rating: 4.1, delivery_performance: 93 },
  { id: "7", vendor: "Auto Parts Pro", vendor_id: "V007", loan_type: "Store Growth", requested_amount: 12000000, approved_amount: 8000000, term_months: 18, interest_rate: 11, status: "approved", applied_date: "2026-05-28", monthly_sales: 8500000, return_rate: 1.5, rating: 4.6, delivery_performance: 97 },
  { id: "8", vendor: "PharmaDirect NG", vendor_id: "V008", loan_type: "Inventory Loan", requested_amount: 4000000, approved_amount: 4000000, term_months: 12, interest_rate: 15, status: "under_review", applied_date: "2026-06-05", monthly_sales: 3200000, return_rate: 2.0, rating: 4.4, delivery_performance: 95 },
  { id: "9", vendor: "Home & Living Ltd", vendor_id: "V009", loan_type: "Fulfillment Credit", requested_amount: 2000000, approved_amount: null, term_months: 6, interest_rate: 14, status: "submitted", applied_date: "2026-06-08", monthly_sales: 1600000, return_rate: 3.0, rating: 4.3, delivery_performance: 92 },
  { id: "10", vendor: "Gadget World NG", vendor_id: "V010", loan_type: "Advertising Credit", requested_amount: 750000, approved_amount: null, term_months: 3, interest_rate: 20, status: "draft", applied_date: "2026-06-14", monthly_sales: 980000, return_rate: 4.8, rating: 3.5, delivery_performance: 85 },
];

const repayments = [
  { id: "1", vendor: "Swift Logistics NG", loan_type: "Fulfillment Credit", amount: 350000, paid: 350000, due_date: "2026-05-20", paid_date: "2026-05-19", status: "paid" },
  { id: "2", vendor: "Swift Logistics NG", loan_type: "Fulfillment Credit", amount: 350000, paid: 350000, due_date: "2026-06-20", paid_date: "2026-06-18", status: "paid" },
  { id: "3", vendor: "Fashion House Abuja", loan_type: "Advertising Credit", amount: 320000, paid: 320000, due_date: "2026-04-01", paid_date: "2026-04-01", status: "paid" },
  { id: "4", vendor: "Fashion House Abuja", loan_type: "Advertising Credit", amount: 320000, paid: 0, due_date: "2026-05-01", paid_date: null, status: "overdue" },
  { id: "5", vendor: "Fashion House Abuja", loan_type: "Advertising Credit", amount: 320000, paid: 0, due_date: "2026-06-01", paid_date: null, status: "overdue" },
  { id: "6", vendor: "Lagos Tech Hub", loan_type: "Advertising Credit", amount: 220000, paid: 220000, due_date: "2026-06-15", paid_date: "2026-06-14", status: "paid" },
  { id: "7", vendor: "Auto Parts Pro", loan_type: "Store Growth", amount: 490000, paid: 490000, due_date: "2026-06-28", paid_date: "2026-06-27", status: "paid" },
  { id: "8", vendor: "PharmaDirect NG", loan_type: "Inventory Loan", amount: 375000, paid: 0, due_date: "2026-07-05", paid_date: null, status: "pending" },
];

const tabs = ["Applications", "Approved", "Repayments", "Dashboard"];

export default function FinancingPage() {
  const [activeTab, setActiveTab] = useState("Applications");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewApp, setViewApp] = useState<FinancingApp | null>(null);

  const totalFinanced = applications.reduce((s, a) => s + (a.approved_amount || 0), 0);
  const activeLoans = applications.filter((a) => a.status === "disbursed" || a.status === "approved").length;
  const atRisk = applications.filter((a) => a.monthly_sales < a.requested_amount * 0.5).length;
  const avgRate = Math.round(applications.reduce((s, a) => s + a.interest_rate, 0) / applications.length);
  const repaymentRate = repayments.length > 0 ? Math.round((repayments.filter((r) => r.status === "paid").length / repayments.length) * 100) : 0;

  const filteredApps = applications.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (search && !a.vendor.toLowerCase().includes(search.toLowerCase()) && !a.loan_type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const approvedApps = applications.filter((a) => a.status === "approved" || a.status === "disbursed");

  return (
    <AdminShell title="Vendor Financing" subtitle="Manage vendor loans and credit facilities">
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Dashboard" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Financed", value: `₦${(totalFinanced / 1e6).toFixed(1)}M`, icon: DollarSign, color: "text-blue" },
              { label: "Active Loans", value: activeLoans, icon: CreditCard, color: "text-green-600" },
              { label: "Repayment Rate", value: `${repaymentRate}%`, icon: TrendingUp, color: "text-purple-600" },
              { label: "Avg Interest Rate", value: `${avgRate}%`, icon: Banknote, color: "text-orange" },
              { label: "At Risk", value: atRisk, icon: AlertTriangle, color: "text-red" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-text-4">{s.label}</span></div>
                <p className="text-xl font-bold text-text-1">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-blue" /> Loan Distribution by Type</h3>
              <div className="space-y-3">
                {loanTypes.map((lt) => {
                  const count = applications.filter((a) => a.loan_type === lt).length;
                  const total = applications.reduce((s, a) => s + (a.loan_type === lt ? a.requested_amount : 0), 0);
                  const maxTotal = Math.max(...loanTypes.map((l) => applications.reduce((s, a) => s + (a.loan_type === l ? a.requested_amount : 0), 0)));
                  return (
                    <div key={lt}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-2">{lt}</span>
                        <span className="font-semibold">{count} apps · ₦{(total / 1e6).toFixed(1)}M</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue" style={{ width: `${(total / maxTotal) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><TrendUp size={16} className="text-blue" /> Application Status</h3>
              <div className="space-y-2">
                {["draft", "submitted", "under_review", "approved", "disbursed"].map((s) => {
                  const count = applications.filter((a) => a.status === s).length;
                  const pct = Math.round((count / applications.length) * 100);
                  const colors: Record<string, string> = { draft: "bg-gray-300", submitted: "bg-blue", under_review: "bg-orange", approved: "bg-green-500", disbursed: "bg-purple-500" };
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors[s]}`} />
                      <span className="text-xs text-text-2 flex-1 capitalize">{s.replace("_", " ")}</span>
                      <span className="text-xs font-semibold">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Applications" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applications..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
            </div>
            {["all", ...["draft", "submitted", "under_review", "approved", "disbursed"]].map((f) => (
              <button key={f} onClick={() => setFilterStatus(f)} className={`px-3 py-2 text-xs rounded-lg border capitalize ${filterStatus === f ? "bg-blue text-white border-blue" : "bg-white border-gray-200 text-text-3"}`}>{f.replace("_", " ")}</button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Vendor", "Loan Type", "Requested", "Term", "Interest", "Status", "Applied", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-medium text-text-1">{a.vendor}</td>
                      <td className="p-3 text-xs">{a.loan_type}</td>
                      <td className="p-3 font-semibold">₦{a.requested_amount.toLocaleString()}</td>
                      <td className="p-3 text-xs">{a.term_months} months</td>
                      <td className="p-3 text-xs">{a.interest_rate}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status === "disbursed" ? "bg-green-50 text-green-600" : a.status === "approved" ? "bg-blue-50 text-blue" : a.status === "under_review" ? "bg-orange-50 text-orange" : a.status === "submitted" ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-text-4"}`}>{a.status.replace("_", " ")}</span>
                      </td>
                      <td className="p-3 text-xs text-text-3">{a.applied_date}</td>
                      <td className="p-3"><button onClick={() => setViewApp(a)} className="text-xs text-blue hover:underline flex items-center gap-1"><Eye size={12} /> Detail</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Approved" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-text-1">Approved & Disbursed Loans</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Vendor", "Loan Type", "Requested", "Approved", "Term", "Interest", "Status", "Applied"].map((h) => (
                    <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {approvedApps.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-text-4 text-sm">No approved loans yet.</td></tr>
                ) : approvedApps.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 font-medium text-text-1">{a.vendor}</td>
                    <td className="p-3 text-xs">{a.loan_type}</td>
                    <td className="p-3">₦{a.requested_amount.toLocaleString()}</td>
                    <td className="p-3 font-semibold text-green-600">₦{(a.approved_amount || 0).toLocaleString()}</td>
                    <td className="p-3 text-xs">{a.term_months} months</td>
                    <td className="p-3 text-xs">{a.interest_rate}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status === "disbursed" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue"}`}>{a.status}</span>
                    </td>
                    <td className="p-3 text-xs text-text-3">{a.applied_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Repayments" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-text-1">Payment Schedule</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Vendor", "Loan Type", "Amount Due", "Amount Paid", "Due Date", "Paid Date", "Status"].map((h) => (
                    <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repayments.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 font-medium text-text-1">{r.vendor}</td>
                    <td className="p-3 text-xs">{r.loan_type}</td>
                    <td className="p-3 font-semibold">₦{r.amount.toLocaleString()}</td>
                    <td className="p-3">₦{r.paid.toLocaleString()}</td>
                    <td className="p-3 text-xs text-text-3">{r.due_date}</td>
                    <td className="p-3 text-xs text-text-3">{r.paid_date || "-"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${r.status === "paid" ? "bg-green-50 text-green-600" : r.status === "overdue" ? "bg-red-50 text-red" : "bg-blue-50 text-blue"}`}>
                        {r.status === "paid" ? <Check size={10} /> : r.status === "overdue" ? <AlertTriangle size={10} /> : <Clock size={10} />}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewApp(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-lg">{viewApp.vendor}</h2>
              <button onClick={() => setViewApp(null)} className="p-2 rounded-lg hover:bg-gray-50 text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-text-4">Vendor ID:</span><p className="font-medium">{viewApp.vendor_id}</p></div>
                <div><span className="text-text-4">Loan Type:</span><p className="font-medium">{viewApp.loan_type}</p></div>
                <div><span className="text-text-4">Requested:</span><p className="font-semibold">₦{viewApp.requested_amount.toLocaleString()}</p></div>
                <div><span className="text-text-4">Approved:</span><p className="font-semibold">₦{(viewApp.approved_amount || 0).toLocaleString()}</p></div>
                <div><span className="text-text-4">Term:</span><p className="font-medium">{viewApp.term_months} months</p></div>
                <div><span className="text-text-4">Interest Rate:</span><p className="font-semibold text-orange">{viewApp.interest_rate}%</p></div>
                <div><span className="text-text-4">Status:</span><p><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${viewApp.status === "disbursed" ? "bg-green-50 text-green-600" : viewApp.status === "approved" ? "bg-blue-50 text-blue" : viewApp.status === "under_review" ? "bg-orange-50 text-orange" : "bg-gray-100 text-text-4"}`}>{viewApp.status.replace("_", " ")}</span></p></div>
                <div><span className="text-text-4">Applied:</span><p className="font-medium">{viewApp.applied_date}</p></div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Building2 size={14} className="text-blue" /> Vendor Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Monthly Sales", value: `₦${(viewApp.monthly_sales / 1e6).toFixed(1)}M`, icon: TrendingUp, color: "text-green-600" },
                    { label: "Return Rate", value: `${viewApp.return_rate}%`, icon: AlertTriangle, color: viewApp.return_rate > 3 ? "text-red" : "text-orange" },
                    { label: "Rating", value: `${viewApp.rating} / 5`, icon: Store, color: "text-blue" },
                    { label: "Delivery Perf.", value: `${viewApp.delivery_performance}%`, icon: TrendUp, color: "text-purple-600" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <m.icon size={14} className={`mx-auto mb-1 ${m.color}`} />
                      <p className="text-[10px] text-text-4">{m.label}</p>
                      <p className="text-sm font-bold text-text-1">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
