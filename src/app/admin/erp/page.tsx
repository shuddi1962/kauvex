"use client";

import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, PackageSearch, Settings2,
  Plus, Edit, X, Save, FileText, BookOpen, PieChart, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const erpTabs = [
  { id: "overview", label: "Overview" },
  { id: "accounts", label: "Chart of Accounts" },
  { id: "journals", label: "Journal Entries" },
  { id: "cost-centers", label: "Cost Centers" },
  { id: "budgets", label: "Budgets" },
];

interface Account {
  id: string;
  account_code: string;
  account_name: string;
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  balance: number;
}

interface JournalEntry {
  id: string;
  entry_number: string;
  date: string;
  description: string;
  debit_total: number;
  credit_total: number;
  status: string;
}

interface CostCenter {
  id: string;
  name: string;
  department: string;
  budget: number;
  spent: number;
  headcount: number;
}

interface Budget {
  id: string;
  category: string;
  fiscal_year: string;
  allocated: number;
  spent: number;
  department: string;
}

const seedAccounts: Account[] = [
  { id: "1", account_code: "1000", account_name: "Cash & Bank", type: "Asset", balance: 45000000 },
  { id: "2", account_code: "1100", account_name: "Accounts Receivable", type: "Asset", balance: 12500000 },
  { id: "3", account_code: "1200", account_name: "Inventory - Finished Goods", type: "Asset", balance: 68000000 },
  { id: "4", account_code: "1300", account_name: "Fixed Assets", type: "Asset", balance: 95000000 },
  { id: "5", account_code: "2000", account_name: "Accounts Payable", type: "Liability", balance: 18200000 },
  { id: "6", account_code: "2100", account_name: "Short-term Loans", type: "Liability", balance: 15000000 },
  { id: "7", account_code: "3000", account_name: "Retained Earnings", type: "Equity", balance: 120000000 },
  { id: "8", account_code: "4000", account_name: "Product Sales", type: "Revenue", balance: 285000000 },
  { id: "9", account_code: "5000", account_name: "Cost of Goods Sold", type: "Expense", balance: 171000000 },
  { id: "10", account_code: "6000", account_name: "Operating Expenses", type: "Expense", balance: 42000000 },
];

const seedJournals: JournalEntry[] = [
  { id: "1", entry_number: "JE-2026-0001", date: "2026-06-01", description: "Monthly sales revenue recognition", debit_total: 12500000, credit_total: 12500000, status: "Posted" },
  { id: "2", entry_number: "JE-2026-0002", date: "2026-06-02", description: "Supplier payment - Tech Distributors Ltd", debit_total: 4800000, credit_total: 4800000, status: "Posted" },
  { id: "3", entry_number: "JE-2026-0003", date: "2026-06-03", description: "Payroll accrual - June 2026", debit_total: 8500000, credit_total: 8500000, status: "Draft" },
  { id: "4", entry_number: "JE-2026-0004", date: "2026-06-05", description: "Inventory adjustment - warehouse count", debit_total: 1200000, credit_total: 1200000, status: "Posted" },
  { id: "5", entry_number: "JE-2026-0005", date: "2026-06-07", description: "Depreciation - IT Equipment", debit_total: 650000, credit_total: 650000, status: "Posted" },
  { id: "6", entry_number: "JE-2026-0006", date: "2026-06-10", description: "Customer invoice #INV-4582", debit_total: 3400000, credit_total: 3400000, status: "Posted" },
  { id: "7", entry_number: "JE-2026-0007", date: "2026-06-12", description: "Marketing campaign cost allocation", debit_total: 2100000, credit_total: 2100000, status: "Draft" },
  { id: "8", entry_number: "JE-2026-0008", date: "2026-06-15", description: "Foreign exchange gain adjustment", debit_total: 380000, credit_total: 380000, status: "Posted" },
];

const seedCostCenters: CostCenter[] = [
  { id: "1", name: "E-commerce Operations", department: "Operations", budget: 25000000, spent: 18200000, headcount: 45 },
  { id: "2", name: "Warehouse & Logistics", department: "Logistics", budget: 38000000, spent: 29100000, headcount: 120 },
  { id: "3", name: "Digital Marketing", department: "Marketing", budget: 18000000, spent: 14500000, headcount: 18 },
  { id: "4", name: "Product Development", department: "Engineering", budget: 45000000, spent: 31200000, headcount: 35 },
  { id: "5", name: "Customer Support", department: "Support", budget: 12000000, spent: 9800000, headcount: 52 },
  { id: "6", name: "Administration", department: "Admin", budget: 8000000, spent: 6200000, headcount: 15 },
  { id: "7", name: "Vendor Management", department: "Procurement", budget: 15000000, spent: 11100000, headcount: 22 },
];

const seedBudgets: Budget[] = [
  { id: "1", category: "Technology Infrastructure", fiscal_year: "FY 2026", allocated: 55000000, spent: 32700000, department: "Engineering" },
  { id: "2", category: "Marketing & Advertising", fiscal_year: "FY 2026", allocated: 42000000, spent: 38400000, department: "Marketing" },
  { id: "3", category: "Logistics & Fulfillment", fiscal_year: "FY 2026", allocated: 68000000, spent: 51200000, department: "Logistics" },
  { id: "4", category: "Staff Salaries & Benefits", fiscal_year: "FY 2026", allocated: 120000000, spent: 89500000, department: "Admin" },
  { id: "5", category: "Office & Facilities", fiscal_year: "FY 2026", allocated: 18000000, spent: 14200000, department: "Admin" },
  { id: "6", category: "Research & Development", fiscal_year: "FY 2026", allocated: 35000000, spent: 19800000, department: "Engineering" },
  { id: "7", category: "Professional Services", fiscal_year: "FY 2026", allocated: 12000000, spent: 8500000, department: "Admin" },
  { id: "8", category: "Training & Development", fiscal_year: "FY 2026", allocated: 5000000, spent: 2100000, department: "HR" },
  { id: "9", category: "Compliance & Audit", fiscal_year: "FY 2026", allocated: 8000000, spent: 4100000, department: "Finance" },
];

const typeColors: Record<string, string> = {
  Asset: "bg-blue-50 text-blue",
  Liability: "bg-yellow-50 text-yellow-700",
  Equity: "bg-purple-50 text-purple-700",
  Revenue: "bg-green-50 text-green-700",
  Expense: "bg-red-50 text-red",
};

const formatCurrency = (val: number) => `₦${(val / 1000000).toFixed(1)}M`;

export default function ERPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [accounts] = useState<Account[]>(seedAccounts);
  const [journals] = useState<JournalEntry[]>(seedJournals);
  const [costCenters] = useState<CostCenter[]>(seedCostCenters);
  const [budgets] = useState<Budget[]>(seedBudgets);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [accountForm, setAccountForm] = useState({ account_code: "", account_name: "", type: "Asset" as Account["type"], balance: 0 });

  const totalRevenue = 285000000;
  const totalExpenses = 171000000 + 42000000;
  const netProfit = totalRevenue - totalExpenses;
  const inventoryCost = 68000000;
  const procurementPipeline = 12500000;
  const operationalCost = 42000000;

  const totalBudgetAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <AdminShell title="ERP Dashboard" subtitle="Chart of Accounts, Journal Entries, Cost Centers, Budgets">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Enterprise Resource Planning</h1>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setEditAccount(null); setAccountForm({ account_code: "", account_name: "", type: "Asset", balance: 0 }); setShowAccountModal(true); }}>
              <Plus size={14} className="mr-1" /> New Account
            </Button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {erpTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue text-white" : "bg-white text-text-3 border border-border hover:bg-off-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "bg-green-50 text-green-700" },
                { label: "Total Expenses", value: formatCurrency(totalExpenses), icon: TrendingDown, color: "bg-red-50 text-red" },
                { label: "Net Profit", value: formatCurrency(netProfit), icon: DollarSign, color: "bg-blue-50 text-blue" },
                { label: "Inventory Cost", value: formatCurrency(inventoryCost), icon: PackageSearch, color: "bg-purple-50 text-purple-700" },
                { label: "Procurement Pipeline", value: formatCurrency(procurementPipeline), icon: BarChart3, color: "bg-orange-50 text-orange" },
                { label: "Operational Cost", value: formatCurrency(operationalCost), icon: Settings2, color: "bg-yellow-50 text-yellow-700" },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
                    <div className={`w-9 h-9 rounded-lg ${kpi.color} flex items-center justify-center mb-2`}><Icon size={16} /></div>
                    <p className="text-xl font-bold text-text-1">{kpi.value}</p>
                    <p className="text-xs text-text-4">{kpi.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><PieChart size={18} /> Income Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Product Sales", value: 285000000, pct: 100 },
                    { label: "COGS", value: -171000000, pct: 60 },
                    { label: "Gross Profit", value: 114000000, pct: 40 },
                    { label: "Operating Expenses", value: -42000000, pct: 14.7 },
                    { label: "Net Profit", value: 72000000, pct: 25.3 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${row.value < 0 ? "text-red" : row.label === "Net Profit" || row.label === "Gross Profit" ? "text-green-700" : "text-text-1"}`}>{row.label}</span>
                      <span className="font-semibold">{row.value < 0 ? `-₦${Math.abs(row.value).toLocaleString()}` : `₦${row.value.toLocaleString()}`}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><Target size={18} /> Budget Utilization</h3>
                <div className="space-y-3">
                  {budgets.slice(0, 5).map((b) => {
                    const pct = Math.round((b.spent / b.allocated) * 100);
                    return (
                      <div key={b.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-text-1">{b.category}</span>
                          <span className="text-text-4">{pct}% used</span>
                        </div>
                        <div className="h-2 bg-off-white rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red" : pct > 70 ? "bg-orange" : "bg-blue"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Chart of Accounts */}
        {activeTab === "accounts" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1">Chart of Accounts</h3>
              <Button size="sm" onClick={() => { setEditAccount(null); setAccountForm({ account_code: "", account_name: "", type: "Asset", balance: 0 }); setShowAccountModal(true); }}>
                <Plus size={14} className="mr-1" /> Add Account
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Code</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Account Name</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Type</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-mono text-text-4">{acc.account_code}</td>
                      <td className="px-5 py-3 font-medium text-text-1">{acc.account_name}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[acc.type]}`}>{acc.type}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{formatCurrency(acc.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Journal Entries */}
        {activeTab === "journals" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><BookOpen size={18} /> Journal Entries</h3>
              <Button size="sm"><Plus size={14} className="mr-1" /> New Entry</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Entry #</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Description</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Debit</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Credit</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {journals.map((je) => (
                    <tr key={je.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-text-3">{je.entry_number}</td>
                      <td className="px-5 py-3 text-text-2">{je.date}</td>
                      <td className="px-5 py-3 text-text-1">{je.description}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{formatCurrency(je.debit_total)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{formatCurrency(je.credit_total)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${je.status === "Posted" ? "bg-green-50 text-green-700" : "bg-gray-100 text-text-4"}`}>{je.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cost Centers */}
        {activeTab === "cost-centers" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costCenters.map((cc) => {
              const pct = Math.round((cc.spent / cc.budget) * 100);
              return (
                <div key={cc.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-soft transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-text-1">{cc.name}</h4>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-off-white text-text-4">{cc.department}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div><p className="text-lg font-bold text-text-1">{formatCurrency(cc.budget)}</p><p className="text-[10px] text-text-4">Budget</p></div>
                    <div><p className="text-lg font-bold text-text-1">{formatCurrency(cc.spent)}</p><p className="text-[10px] text-text-4">Spent</p></div>
                  </div>
                  <div className="h-1.5 bg-off-white rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${pct > 90 ? "bg-red" : pct > 70 ? "bg-orange" : "bg-blue"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-4">{pct}% utilized</span>
                    <span className="text-text-4">{cc.headcount} headcount</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Budgets */}
        {activeTab === "budgets" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1">Budget Allocations</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-text-4">Total: <strong className="text-text-1">{formatCurrency(totalBudgetAllocated)}</strong></span>
                <span className="text-text-4">Spent: <strong className="text-text-1">{formatCurrency(totalBudgetSpent)}</strong></span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Category</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Department</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Fiscal Year</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Allocated</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Spent</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {budgets.map((b) => {
                    const pct = Math.round((b.spent / b.allocated) * 100);
                    return (
                      <tr key={b.id} className="hover:bg-off-white transition-colors">
                        <td className="px-5 py-3 font-medium text-text-1">{b.category}</td>
                        <td className="px-5 py-3 text-text-3">{b.department}</td>
                        <td className="px-5 py-3 text-center text-text-4">{b.fiscal_year}</td>
                        <td className="px-5 py-3 text-right font-semibold text-text-1">{formatCurrency(b.allocated)}</td>
                        <td className="px-5 py-3 text-right font-semibold text-text-1">{formatCurrency(b.spent)}</td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 h-1.5 bg-off-white rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct > 90 ? "bg-red" : pct > 70 ? "bg-orange" : "bg-blue"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-text-4">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAccountModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[460px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">{editAccount ? "Edit Account" : "New Account"}</h2>
              <button onClick={() => setShowAccountModal(false)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Account Code</label>
                  <input value={accountForm.account_code} onChange={(e) => setAccountForm({ ...accountForm, account_code: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Account Type</label>
                  <select value={accountForm.type} onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as Account["type"] })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    {["Asset", "Liability", "Equity", "Revenue", "Expense"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select></div>
              </div>
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Account Name</label>
                <input value={accountForm.account_name} onChange={(e) => setAccountForm({ ...accountForm, account_name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Balance (₦)</label>
                <input type="number" value={accountForm.balance} onChange={(e) => setAccountForm({ ...accountForm, balance: +e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setShowAccountModal(false)}>Cancel</Button>
              <Button className="flex-1" disabled={!accountForm.account_name}><Save size={14} className="mr-1" /> {editAccount ? "Update" : "Create Account"}</Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
