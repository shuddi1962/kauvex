"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  CreditCard, Search, Eye, TrendingUp, DollarSign,
  AlertTriangle, Users, X, Check, Clock, Ban, BarChart3,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";

interface BNPLPlan {
  id: string;
  name: string;
  down_payment: number;
  installments: number;
  frequency: string;
  interest_rate: number;
  status: string;
}

interface Contract {
  id: string;
  contract_number: string;
  customer: string;
  email: string;
  plan: string;
  total: number;
  down_paid: number;
  balance: number;
  installment_amount: number;
  status: string;
  next_payment: string;
  started: string;
}

interface Payment {
  id: string;
  contract_number: string;
  installment: number;
  total_installments: number;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  method: string;
}

interface CreditScore {
  id: string;
  customer: string;
  email: string;
  score: number;
  tier: string;
  active_contracts: number;
  late_payments: number;
  total_borrowed: number;
}

const plans: BNPLPlan[] = [
  { id: "1", name: "25% Down - 4 Bi-Weekly", down_payment: 25, installments: 4, frequency: "Bi-Weekly", interest_rate: 0, status: "active" },
  { id: "2", name: "30% Down - 3 Monthly", down_payment: 30, installments: 3, frequency: "Monthly", interest_rate: 0, status: "active" },
  { id: "3", name: "10% Down - 6 Monthly", down_payment: 10, installments: 6, frequency: "Monthly", interest_rate: 5, status: "active" },
  { id: "4", name: "0% Down - 4 Weekly", down_payment: 0, installments: 4, frequency: "Weekly", interest_rate: 8, status: "active" },
  { id: "5", name: "20% Down - 8 Bi-Weekly", down_payment: 20, installments: 8, frequency: "Bi-Weekly", interest_rate: 3, status: "active" },
  { id: "6", name: "50% Down - 2 Monthly", down_payment: 50, installments: 2, frequency: "Monthly", interest_rate: 0, status: "active" },
  { id: "7", name: "15% Down - 12 Monthly", down_payment: 15, installments: 12, frequency: "Monthly", interest_rate: 10, status: "inactive" },
  { id: "8", name: "40% Down - 3 Bi-Weekly", down_payment: 40, installments: 3, frequency: "Bi-Weekly", interest_rate: 0, status: "active" },
];

const contracts: Contract[] = [
  { id: "1", contract_number: "BNPL-24001", customer: "Amara Okafor", email: "amara.o@email.com", plan: "25% Down - 4 Bi-Weekly", total: 340000, down_paid: 85000, balance: 255000, installment_amount: 63750, status: "active", next_payment: "2026-07-01", started: "2026-05-15" },
  { id: "2", contract_number: "BNPL-24002", customer: "Chidi Nwosu", email: "chidi.n@email.com", plan: "30% Down - 3 Monthly", total: 1250000, down_paid: 375000, balance: 875000, installment_amount: 291667, status: "active", next_payment: "2026-06-28", started: "2026-04-20" },
  { id: "3", contract_number: "BNPL-24003", customer: "Folake Adeyemi", email: "folake.a@email.com", plan: "10% Down - 6 Monthly", total: 780000, down_paid: 78000, balance: 702000, installment_amount: 117000, status: "active", next_payment: "2026-07-10", started: "2026-03-05" },
  { id: "4", contract_number: "BNPL-24004", customer: "Emeka Obi", email: "emeka.o@email.com", plan: "0% Down - 4 Weekly", total: 215000, down_paid: 0, balance: 215000, installment_amount: 53750, status: "active", next_payment: "2026-06-22", started: "2026-05-28" },
  { id: "5", contract_number: "BNPL-24005", customer: "Zainab Bello", email: "zainab.b@email.com", plan: "20% Down - 8 Bi-Weekly", total: 560000, down_paid: 112000, balance: 448000, installment_amount: 56000, status: "completed", next_payment: "-", started: "2026-01-10" },
  { id: "6", contract_number: "BNPL-24006", customer: "Kelechi Eze", email: "kelechi.e@email.com", plan: "25% Down - 4 Bi-Weekly", total: 920000, down_paid: 230000, balance: 690000, installment_amount: 172500, status: "active", next_payment: "2026-06-25", started: "2026-05-01" },
  { id: "7", contract_number: "BNPL-24007", customer: "Yetunde Lawal", email: "yetunde.l@email.com", plan: "50% Down - 2 Monthly", total: 1500000, down_paid: 750000, balance: 750000, installment_amount: 375000, status: "late", next_payment: "Overdue", started: "2026-03-15" },
  { id: "8", contract_number: "BNPL-24008", customer: "Ibrahim Musa", email: "ibrahim.m@email.com", plan: "30% Down - 3 Monthly", total: 480000, down_paid: 144000, balance: 336000, installment_amount: 112000, status: "active", next_payment: "2026-07-05", started: "2026-05-20" },
  { id: "9", contract_number: "BNPL-24009", customer: "Ngozi Okonkwo", email: "ngozi.o@email.com", plan: "10% Down - 6 Monthly", total: 1100000, down_paid: 110000, balance: 990000, installment_amount: 165000, status: "defaulted", next_payment: "Overdue", started: "2026-02-01" },
];

const payments: Payment[] = [
  { id: "1", contract_number: "BNPL-24001", installment: 1, total_installments: 4, amount: 63750, due_date: "2026-05-29", paid_date: "2026-05-28", status: "paid", method: "card" },
  { id: "2", contract_number: "BNPL-24001", installment: 2, total_installments: 4, amount: 63750, due_date: "2026-06-12", paid_date: "2026-06-11", status: "paid", method: "transfer" },
  { id: "3", contract_number: "BNPL-24001", installment: 3, total_installments: 4, amount: 63750, due_date: "2026-06-26", paid_date: null, status: "pending", method: "" },
  { id: "4", contract_number: "BNPL-24001", installment: 4, total_installments: 4, amount: 63750, due_date: "2026-07-10", paid_date: null, status: "pending", method: "" },
  { id: "5", contract_number: "BNPL-24004", installment: 1, total_installments: 4, amount: 53750, due_date: "2026-06-04", paid_date: "2026-06-03", status: "paid", method: "card" },
  { id: "6", contract_number: "BNPL-24004", installment: 2, total_installments: 4, amount: 53750, due_date: "2026-06-11", paid_date: null, status: "pending", method: "" },
  { id: "7", contract_number: "BNPL-24007", installment: 1, total_installments: 2, amount: 375000, due_date: "2026-04-15", paid_date: null, status: "overdue", method: "" },
  { id: "8", contract_number: "BNPL-24007", installment: 2, total_installments: 2, amount: 375000, due_date: "2026-05-15", paid_date: null, status: "overdue", method: "" },
  { id: "9", contract_number: "BNPL-24009", installment: 1, total_installments: 6, amount: 165000, due_date: "2026-03-03", paid_date: "2026-03-02", status: "paid", method: "transfer" },
  { id: "10", contract_number: "BNPL-24009", installment: 2, total_installments: 6, amount: 165000, due_date: "2026-04-03", paid_date: null, status: "overdue", method: "" },
];

const creditScores: CreditScore[] = [
  { id: "1", customer: "Amara Okafor", email: "amara.o@email.com", score: 720, tier: "Gold", active_contracts: 1, late_payments: 0, total_borrowed: 340000 },
  { id: "2", customer: "Chidi Nwosu", email: "chidi.n@email.com", score: 685, tier: "Silver", active_contracts: 1, late_payments: 0, total_borrowed: 1250000 },
  { id: "3", customer: "Folake Adeyemi", email: "folake.a@email.com", score: 750, tier: "Gold", active_contracts: 2, late_payments: 0, total_borrowed: 780000 },
  { id: "4", customer: "Emeka Obi", email: "emeka.o@email.com", score: 620, tier: "Standard", active_contracts: 1, late_payments: 1, total_borrowed: 215000 },
  { id: "5", customer: "Zainab Bello", email: "zainab.b@email.com", score: 800, tier: "Platinum", active_contracts: 0, late_payments: 0, total_borrowed: 560000 },
  { id: "6", customer: "Kelechi Eze", email: "kelechi.e@email.com", score: 670, tier: "Silver", active_contracts: 1, late_payments: 0, total_borrowed: 920000 },
  { id: "7", customer: "Yetunde Lawal", email: "yetunde.l@email.com", score: 550, tier: "Standard", active_contracts: 1, late_payments: 2, total_borrowed: 1500000 },
  { id: "8", customer: "Ibrahim Musa", email: "ibrahim.m@email.com", score: 710, tier: "Gold", active_contracts: 1, late_payments: 0, total_borrowed: 480000 },
  { id: "9", customer: "Ngozi Okonkwo", email: "ngozi.o@email.com", score: 480, tier: "Restricted", active_contracts: 1, late_payments: 4, total_borrowed: 1100000 },
  { id: "10", customer: "Tunde Balogun", email: "tunde.b@email.com", score: 760, tier: "Gold", active_contracts: 2, late_payments: 0, total_borrowed: 2100000 },
];

const tabs = ["Overview", "Plans", "Contracts", "Payments", "Credit Scores"];

export default function BNPLPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [contractFilter, setContractFilter] = useState("all");
  const [viewContract, setViewContract] = useState<Contract | null>(null);

  const totalFinanced = contracts.reduce((s, c) => s + c.total, 0);
  const totalBalance = contracts.reduce((s, c) => s + c.balance, 0);
  const lateCount = contracts.filter((c) => c.status === "late" || c.status === "defaulted").length;
  const avgScore = Math.round(creditScores.reduce((s, c) => s + c.score, 0) / creditScores.length);
  const repaymentRate = contracts.length > 0 ? Math.round(((contracts.length - lateCount) / contracts.length) * 100) : 0;

  const filteredContracts = contracts.filter((c) => {
    if (contractFilter !== "all" && c.status !== contractFilter) return false;
    if (search && !c.customer.toLowerCase().includes(search.toLowerCase()) && !c.contract_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredPayments = payments.filter((p) => {
    if (search && !p.contract_number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredScores = creditScores.filter((s) => {
    if (search && !s.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminShell title="Buy Now Pay Later" subtitle="BNPL system management">
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Active Contracts", value: contracts.filter((c) => c.status === "active").length, icon: CreditCard, color: "text-blue" },
              { label: "Total Financed", value: `₦${(totalFinanced / 1e6).toFixed(1)}M`, icon: DollarSign, color: "text-green-600" },
              { label: "Repayment Rate", value: `${repaymentRate}%`, icon: TrendingUp, color: "text-purple-600" },
              { label: "Late Payments", value: lateCount, icon: AlertTriangle, color: "text-red" },
              { label: "Avg Credit Score", value: avgScore, icon: BarChart3, color: "text-blue" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-text-4">{s.label}</span></div>
                <p className="text-xl font-bold text-text-1">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-blue" /> Portfolio Health</h3>
              <div className="space-y-2">
                {[
                  { label: "Total Financed", value: `₦${(totalFinanced / 1e6).toFixed(1)}M`, pct: 100, color: "bg-blue" },
                  { label: "Outstanding Balance", value: `₦${(totalBalance / 1e6).toFixed(1)}M`, pct: Math.round((totalBalance / totalFinanced) * 100), color: "bg-orange" },
                  { label: "Total Repaid", value: `₦${((totalFinanced - totalBalance) / 1e6).toFixed(1)}M`, pct: Math.round(((totalFinanced - totalBalance) / totalFinanced) * 100), color: "bg-green-500" },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-text-3">{b.label}</span><span className="font-semibold">{b.value}</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Users size={16} className="text-blue" /> Credit Tier Distribution</h3>
              <div className="space-y-2">
                {[
                  { tier: "Platinum", count: creditScores.filter((s) => s.tier === "Platinum").length, color: "bg-blue" },
                  { tier: "Gold", count: creditScores.filter((s) => s.tier === "Gold").length, color: "bg-orange" },
                  { tier: "Silver", count: creditScores.filter((s) => s.tier === "Silver").length, color: "bg-purple-500" },
                  { tier: "Standard", count: creditScores.filter((s) => s.tier === "Standard").length, color: "bg-green-500" },
                  { tier: "Restricted", count: creditScores.filter((s) => s.tier === "Restricted").length, color: "bg-red" },
                ].map((t) => (
                  <div key={t.tier} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${t.color}`} />
                    <span className="text-xs text-text-2 flex-1">{t.tier}</span>
                    <span className="text-xs font-semibold">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Plans" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-text-1">BNPL Plan Options</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Plan Name", "Down Payment", "Installments", "Frequency", "Interest Rate", "Status"].map((h) => (
                    <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 font-medium text-text-1">{plan.name}</td>
                    <td className="p-3">{plan.down_payment}% Down</td>
                    <td className="p-3">{plan.installments}</td>
                    <td className="p-3">{plan.frequency}</td>
                    <td className="p-3">{plan.interest_rate > 0 ? `${plan.interest_rate}%` : "0% (Interest-Free)"}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${plan.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-text-4"}`}>{plan.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Contracts" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contracts..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
            </div>
            {["all", "active", "completed", "late", "defaulted"].map((f) => (
              <button key={f} onClick={() => setContractFilter(f)} className={`px-3 py-2 text-xs rounded-lg border capitalize ${contractFilter === f ? "bg-blue text-white border-blue" : "bg-white border-gray-200 text-text-3"}`}>{f}</button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Contract", "Customer", "Plan", "Total", "Balance", "Status", "Next Payment", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center text-text-4 text-sm">No contracts found.</td></tr>
                  ) : filteredContracts.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs font-semibold text-blue">{c.contract_number}</td>
                      <td className="p-3">
                        <p className="font-medium text-text-1">{c.customer}</p>
                        <p className="text-[10px] text-text-4">{c.email}</p>
                      </td>
                      <td className="p-3 text-xs">{c.plan}</td>
                      <td className="p-3 font-semibold">₦{c.total.toLocaleString()}</td>
                      <td className="p-3 font-semibold">₦{c.balance.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.status === "active" ? "bg-blue-50 text-blue" : c.status === "completed" ? "bg-green-50 text-green-600" : c.status === "late" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red"}`}>{c.status}</span>
                      </td>
                      <td className="p-3 text-xs text-text-3">{c.next_payment}</td>
                      <td className="p-3"><button onClick={() => setViewContract(c)} className="text-xs text-blue hover:underline flex items-center gap-1"><Eye size={12} /> View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Payments" && (
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by contract..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Contract", "Installment", "Amount", "Due Date", "Paid Date", "Method", "Status"].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs font-semibold text-blue">{p.contract_number}</td>
                      <td className="p-3 text-xs">{p.installment} of {p.total_installments}</td>
                      <td className="p-3 font-semibold">₦{p.amount.toLocaleString()}</td>
                      <td className="p-3 text-xs text-text-3">{p.due_date}</td>
                      <td className="p-3 text-xs text-text-3">{p.paid_date || "-"}</td>
                      <td className="p-3 text-xs capitalize">{p.method || "-"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${p.status === "paid" ? "bg-green-50 text-green-600" : p.status === "pending" ? "bg-blue-50 text-blue" : "bg-red-50 text-red"}`}>
                          {p.status === "paid" ? <Check size={10} /> : p.status === "pending" ? <Clock size={10} /> : <Ban size={10} />}
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Credit Scores" && (
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Customer", "Score", "Tier", "Active Contracts", "Late Payments", "Total Borrowed"].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredScores.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium text-text-1">{s.customer}</p>
                        <p className="text-[10px] text-text-4">{s.email}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${s.score >= 750 ? "text-blue" : s.score >= 650 ? "text-green-600" : s.score >= 550 ? "text-orange" : "text-red"}`}>{s.score}</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.score >= 750 ? "bg-blue" : s.score >= 650 ? "bg-green-500" : s.score >= 550 ? "bg-orange" : "bg-red"}`} style={{ width: `${(s.score / 850) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.tier === "Platinum" ? "bg-blue text-white" : s.tier === "Gold" ? "bg-orange text-white" : s.tier === "Silver" ? "bg-gray-200 text-gray-700" : s.tier === "Standard" ? "bg-green-50 text-green-600" : "bg-red-50 text-red"}`}>{s.tier}</span>
                      </td>
                      <td className="p-3 font-semibold">{s.active_contracts}</td>
                      <td className="p-3">
                        <span className={`flex items-center gap-1 ${s.late_payments > 0 ? "text-red" : "text-green-600"}`}>
                          {s.late_payments > 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                          {s.late_payments}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">₦{s.total_borrowed.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewContract && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewContract(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-lg">{viewContract.contract_number}</h2>
              <button onClick={() => setViewContract(null)} className="p-2 rounded-lg hover:bg-gray-50 text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-text-4">Customer:</span><p className="font-medium">{viewContract.customer}</p></div>
                <div><span className="text-text-4">Email:</span><p className="font-medium text-xs">{viewContract.email}</p></div>
                <div><span className="text-text-4">Plan:</span><p className="font-medium">{viewContract.plan}</p></div>
                <div><span className="text-text-4">Status:</span><p><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${viewContract.status === "active" ? "bg-blue-50 text-blue" : viewContract.status === "completed" ? "bg-green-50 text-green-600" : viewContract.status === "late" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red"}`}>{viewContract.status}</span></p></div>
                <div><span className="text-text-4">Total:</span><p className="font-semibold">₦{viewContract.total.toLocaleString()}</p></div>
                <div><span className="text-text-4">Down Paid:</span><p className="font-semibold">₦{viewContract.down_paid.toLocaleString()}</p></div>
                <div><span className="text-text-4">Balance:</span><p className="font-semibold text-orange">₦{viewContract.balance.toLocaleString()}</p></div>
                <div><span className="text-text-4">Installment:</span><p className="font-semibold">₦{viewContract.installment_amount.toLocaleString()}</p></div>
                <div><span className="text-text-4">Started:</span><p className="font-medium">{viewContract.started}</p></div>
                <div><span className="text-text-4">Next Payment:</span><p className="font-medium">{viewContract.next_payment}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 h-9 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-600">View Schedule</button>
                <button className="flex-1 h-9 border border-gray-200 rounded-lg text-sm text-text-2 hover:bg-gray-50">Send Reminder</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
