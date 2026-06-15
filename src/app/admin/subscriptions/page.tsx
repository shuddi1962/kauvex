"use client";

import { useState } from "react";
import {
  Repeat, Users, DollarSign, TrendingDown, Plus, Eye, Edit, Trash2,
  CheckCircle, XCircle, Calendar, CreditCard, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const subTabs = [
  { id: "plans", label: "Plans", icon: Repeat },
  { id: "subscriptions", label: "Active Subscriptions", icon: Users },
  { id: "orders", label: "Orders", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: TrendingDown },
];

interface Plan {
  id: string;
  name: string;
  frequency: string;
  price: number;
  trial_days: number;
  is_active: boolean;
  description: string;
}

interface Subscription {
  id: string;
  customer: string;
  customer_email: string;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  next_billing: string;
  billing_count: number;
}

interface SubOrder {
  id: string;
  subscription_id: string;
  subscription_name: string;
  order_id: string;
  period: string;
  amount: number;
  status: string;
}

const seedPlans: Plan[] = [
  { id: "p1", name: "Weekly Essentials Box", frequency: "weekly", price: 15000, trial_days: 0, is_active: true, description: "Fresh groceries and essentials delivered every week" },
  { id: "p2", name: "Monthly Beauty Box", frequency: "monthly", price: 25000, trial_days: 7, is_active: true, description: "Curated beauty and skincare products monthly" },
  { id: "p3", name: "Premium Snack Club", frequency: "monthly", price: 18000, trial_days: 7, is_active: true, description: "Gourmet snacks from around the world" },
  { id: "p4", name: "Fitness Nutrition Plan", frequency: "monthly", price: 35000, trial_days: 14, is_active: true, description: "Protein, supplements and meal replacements" },
  { id: "p5", name: "Quarterly Wine Club", frequency: "quarterly", price: 95000, trial_days: 0, is_active: true, description: "Premium wines delivered every 3 months" },
  { id: "p6", name: "Annual Smart Home Care", frequency: "yearly", price: 120000, trial_days: 30, is_active: true, description: "Yearly smart home device protection and updates" },
  { id: "p7", name: "Weekly Pet Treat Box", frequency: "weekly", price: 8000, trial_days: 0, is_active: false, description: "Treats and toys for your furry friends" },
  { id: "p8", name: "Monthly Coffee Subscription", frequency: "monthly", price: 12000, trial_days: 7, is_active: true, description: "Freshly roasted coffee beans delivered monthly" },
];

const seedSubscriptions: Subscription[] = [
  { id: "sub1", customer: "Chioma Nwachukwu", customer_email: "chioma.n@email.com", plan_name: "Monthly Beauty Box", status: "active", start_date: "2026-01-15", end_date: "2026-12-15", next_billing: "2026-07-15", billing_count: 5 },
  { id: "sub2", customer: "Emeka Okafor", customer_email: "emeka.o@email.com", plan_name: "Premium Snack Club", status: "active", start_date: "2026-03-01", end_date: "2027-03-01", next_billing: "2026-07-01", billing_count: 3 },
  { id: "sub3", customer: "Temidayo Akin", customer_email: "temidayo.a@email.com", plan_name: "Fitness Nutrition Plan", status: "active", start_date: "2026-02-10", end_date: "2026-08-10", next_billing: "2026-07-10", billing_count: 4 },
  { id: "sub4", customer: "Nkechi Obi", customer_email: "nkechi.o@email.com", plan_name: "Weekly Essentials Box", status: "active", start_date: "2026-04-05", end_date: "2027-04-05", next_billing: "2026-06-22", billing_count: 10 },
  { id: "sub5", customer: "Kayode Balogun", customer_email: "kayode.b@email.com", plan_name: "Quarterly Wine Club", status: "active", start_date: "2025-10-01", end_date: "2026-10-01", next_billing: "2026-07-01", billing_count: 2 },
  { id: "sub6", customer: "Zainab Abdullah", customer_email: "zainab.a@email.com", plan_name: "Monthly Coffee Subscription", status: "active", start_date: "2026-05-01", end_date: "2027-05-01", next_billing: "2026-07-01", billing_count: 1 },
  { id: "sub7", customer: "Ifeanyi Eze", customer_email: "ifeanyi.e@email.com", plan_name: "Annual Smart Home Care", status: "active", start_date: "2026-01-01", end_date: "2027-01-01", next_billing: "2027-01-01", billing_count: 5 },
  { id: "sub8", customer: "Amina Bello", customer_email: "amina.b@email.com", plan_name: "Monthly Beauty Box", status: "paused", start_date: "2026-02-20", end_date: "2026-08-20", next_billing: "—", billing_count: 3 },
  { id: "sub9", customer: "Oluwaseun Adeyemi", customer_email: "oluwaseun.a@email.com", plan_name: "Premium Snack Club", status: "cancelled", start_date: "2026-01-10", end_date: "2026-04-10", next_billing: "—", billing_count: 3 },
  { id: "sub10", customer: "Folake Daniels", customer_email: "folake.d@email.com", plan_name: "Fitness Nutrition Plan", status: "active", start_date: "2026-03-15", end_date: "2027-03-15", next_billing: "2026-07-15", billing_count: 3 },
  { id: "sub11", customer: "Chukwudi Nnamdi", customer_email: "chukwudi.n@email.com", plan_name: "Weekly Essentials Box", status: "active", start_date: "2026-04-20", end_date: "2027-04-20", next_billing: "2026-06-27", billing_count: 8 },
  { id: "sub12", customer: "Bisola Savage", customer_email: "bisola.s@email.com", plan_name: "Monthly Coffee Subscription", status: "active", start_date: "2026-05-10", end_date: "2027-05-10", next_billing: "2026-07-10", billing_count: 1 },
];

const seedSubOrders: SubOrder[] = [
  { id: "so1", subscription_id: "sub1", subscription_name: "Monthly Beauty Box", order_id: "ORD-1001", period: "Jan 2026", amount: 25000, status: "completed" },
  { id: "so2", subscription_id: "sub1", subscription_name: "Monthly Beauty Box", order_id: "ORD-1023", period: "Feb 2026", amount: 25000, status: "completed" },
  { id: "so3", subscription_id: "sub1", subscription_name: "Monthly Beauty Box", order_id: "ORD-1056", period: "Mar 2026", amount: 25000, status: "completed" },
  { id: "so4", subscription_id: "sub1", subscription_name: "Monthly Beauty Box", order_id: "ORD-1089", period: "Apr 2026", amount: 25000, status: "completed" },
  { id: "so5", subscription_id: "sub2", subscription_name: "Premium Snack Club", order_id: "ORD-1034", period: "Mar 2026", amount: 18000, status: "completed" },
  { id: "so6", subscription_id: "sub2", subscription_name: "Premium Snack Club", order_id: "ORD-1067", period: "Apr 2026", amount: 18000, status: "completed" },
  { id: "so7", subscription_id: "sub2", subscription_name: "Premium Snack Club", order_id: "ORD-1100", period: "May 2026", amount: 18000, status: "completed" },
  { id: "so8", subscription_id: "sub3", subscription_name: "Fitness Nutrition Plan", order_id: "ORD-1045", period: "Feb 2026", amount: 35000, status: "completed" },
  { id: "so9", subscription_id: "sub3", subscription_name: "Fitness Nutrition Plan", order_id: "ORD-1078", period: "Mar 2026", amount: 35000, status: "completed" },
  { id: "so10", subscription_id: "sub4", subscription_name: "Weekly Essentials Box", order_id: "ORD-1022", period: "Wk 14", amount: 15000, status: "completed" },
  { id: "so11", subscription_id: "sub4", subscription_name: "Weekly Essentials Box", order_id: "ORD-1044", period: "Wk 15", amount: 15000, status: "completed" },
  { id: "so12", subscription_id: "sub4", subscription_name: "Weekly Essentials Box", order_id: "ORD-1066", period: "Wk 16", amount: 15000, status: "completed" },
  { id: "so13", subscription_id: "sub5", subscription_name: "Quarterly Wine Club", order_id: "ORD-1099", period: "Q1 2026", amount: 95000, status: "completed" },
  { id: "so14", subscription_id: "sub5", subscription_name: "Quarterly Wine Club", order_id: "ORD-1122", period: "Q2 2026", amount: 95000, status: "pending" },
  { id: "so15", subscription_id: "sub9", subscription_name: "Premium Snack Club", order_id: "ORD-1040", period: "Jan 2026", amount: 18000, status: "completed" },
  { id: "so16", subscription_id: "sub9", subscription_name: "Premium Snack Club", order_id: "ORD-1070", period: "Feb 2026", amount: 18000, status: "completed" },
  { id: "so17", subscription_id: "sub9", subscription_name: "Premium Snack Club", order_id: "ORD-1105", period: "Mar 2026", amount: 18000, status: "completed" },
  { id: "so18", subscription_id: "sub7", subscription_name: "Annual Smart Home Care", order_id: "ORD-1005", period: "Jan 2026", amount: 120000, status: "completed" },
];

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("plans");
  const [plans] = useState<Plan[]>(seedPlans);
  const [subscriptions] = useState<Subscription[]>(seedSubscriptions);

  const activeSubs = subscriptions.filter(s => s.status === "active").length;
  const mrr = subscriptions.filter(s => s.status === "active").reduce((sum, s) => {
    const plan = plans.find(p => p.name === s.plan_name);
    if (!plan) return sum;
    const freq = plan.frequency;
    const monthly = freq === "weekly" ? plan.price * 4.33 : freq === "quarterly" ? plan.price / 3 : freq === "yearly" ? plan.price / 12 : plan.price;
    return sum + monthly;
  }, 0);
  const churned = subscriptions.filter(s => s.status === "cancelled").length;
  const churnRate = subscriptions.length > 0 ? Math.round((churned / subscriptions.length) * 100) : 0;
  const avgLtv = subscriptions.length > 0 ? Math.round(subscriptions.reduce((sum, s) => {
    const plan = plans.find(p => p.name === s.plan_name);
    if (!plan) return sum;
    return sum + plan.price * s.billing_count;
  }, 0) / subscriptions.length) : 0;

  return (
    <AdminShell title="Subscription Commerce" subtitle="Manage subscription plans, active subscribers, and recurring billing">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-syne font-700 text-2xl text-text-1">Subscriptions</h1>
            <p className="text-sm text-text-3 mt-1">Recurring plans, subscriber management, and order tracking</p>
          </div>
          <Button variant="default" size="sm"><Plus className="w-3 h-3 mr-1" /> Create Plan</Button>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-off-white"}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Plans */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{plans.length}</p>
                <p className="text-xs text-text-3 mt-1">Total Plans</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">{plans.filter(p => p.is_active).length}</p>
                <p className="text-xs text-text-3 mt-1">Active Plans</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{plans.filter(p => p.trial_days > 0).length}</p>
                <p className="text-xs text-text-3 mt-1">Plans w/ Trial</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">₦{Math.round(plans.reduce((s, p) => s + p.price, 0) / plans.length).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Avg Plan Price</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-off-white border-b border-border">
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Plan</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Frequency</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Price</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Trial Days</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Active</th>
                    <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-b border-border hover:bg-off-white/50">
                      <td className="p-3">
                        <p className="text-sm font-medium text-text-1">{plan.name}</p>
                        <p className="text-xs text-text-4">{plan.description}</p>
                      </td>
                      <td className="p-3 text-center text-sm text-text-3 capitalize">{plan.frequency}</td>
                      <td className="p-3 text-center font-syne font-600 text-sm text-text-1">₦{plan.price.toLocaleString()}</td>
                      <td className="p-3 text-center text-sm text-text-2">{plan.trial_days > 0 ? `${plan.trial_days} days` : "—"}</td>
                      <td className="p-3 text-center">{plan.is_active ? <CheckCircle size={14} className="text-success inline" /> : <XCircle size={14} className="text-text-4 inline" />}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Edit className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions */}
        {activeTab === "subscriptions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{activeSubs}</p>
                <p className="text-xs text-text-3 mt-1">Active Subscriptions</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">₦{Math.round(mrr).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Monthly Recurring Revenue</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{churnRate}%</p>
                <p className="text-xs text-text-3 mt-1">Churn Rate</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">₦{avgLtv.toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Avg Lifetime Value</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-off-white border-b border-border">
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Customer</th>
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Plan</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Status</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Period</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Billings</th>
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Next Billing</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border hover:bg-off-white/50">
                      <td className="p-3">
                        <p className="text-sm font-medium text-text-1">{sub.customer}</p>
                        <p className="text-xs text-text-4">{sub.customer_email}</p>
                      </td>
                      <td className="p-3 text-sm text-text-2">{sub.plan_name}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.status === "active" ? "bg-green-50 text-success" : sub.status === "paused" ? "bg-yellow-50 text-warning" : "bg-red-50 text-red"}`}>{sub.status}</span>
                      </td>
                      <td className="p-3 text-center text-xs text-text-3">{sub.start_date} — {sub.end_date}</td>
                      <td className="p-3 text-center font-syne font-600 text-sm text-text-1">{sub.billing_count}</td>
                      <td className="p-3 text-xs text-text-3">{sub.next_billing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{seedSubOrders.length}</p>
                <p className="text-xs text-text-3 mt-1">Total Orders</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">{seedSubOrders.filter(o => o.status === "completed").length}</p>
                <p className="text-xs text-text-3 mt-1">Completed</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{seedSubOrders.filter(o => o.status === "pending").length}</p>
                <p className="text-xs text-text-3 mt-1">Pending</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">₦{seedSubOrders.reduce((s, o) => s + o.amount, 0).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Revenue</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-off-white border-b border-border">
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Subscription</th>
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Order ID</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Period</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Amount</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {seedSubOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border hover:bg-off-white/50">
                      <td className="p-3">
                        <p className="text-sm font-medium text-text-1">{o.subscription_name}</p>
                        <p className="text-xs text-text-4">ID: {o.subscription_id}</p>
                      </td>
                      <td className="p-3 text-sm font-mono text-text-2">{o.order_id}</td>
                      <td className="p-3 text-center text-sm text-text-3">{o.period}</td>
                      <td className="p-3 text-center font-syne font-600 text-sm text-text-1">₦{o.amount.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${o.status === "completed" ? "bg-green-50 text-success" : "bg-yellow-50 text-warning"}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{activeSubs}</p>
                <p className="text-xs text-text-3 mt-1">Active Subscribers</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">₦{Math.round(mrr).toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Monthly Recurring Revenue</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{churnRate}%</p>
                <p className="text-xs text-text-3 mt-1">Churn Rate</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">₦{avgLtv.toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Avg Lifetime Value</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-syne font-600 text-sm text-text-1 mb-3 flex items-center gap-2"><Package size={16} className="text-blue" /> Most Popular Plans</h3>
                <div className="space-y-2">
                  {[...subscriptions].reduce<{ name: string; count: number }[]>((acc, s) => {
                    const existing = acc.find(a => a.name === s.plan_name);
                    if (existing) existing.count++;
                    else acc.push({ name: s.plan_name, count: 1 });
                    return acc;
                  }, []).sort((a, b) => b.count - a.count).slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-4 w-4">{i + 1}</span>
                        <span className="text-sm text-text-1">{item.name}</span>
                      </div>
                      <span className="text-xs text-text-3">{item.count} subscribers</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-syne font-600 text-sm text-text-1 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-success" /> Revenue by Plan</h3>
                <div className="space-y-2">
                  {plans.filter(p => p.is_active).slice(0, 5).map((plan) => {
                    const subsOnPlan = subscriptions.filter(s => s.plan_name === plan.name && s.status === "active").length;
                    return (
                      <div key={plan.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <span className="text-sm text-text-1">{plan.name}</span>
                        <span className="text-xs text-success">₦{(plan.price * subsOnPlan).toLocaleString()}/mo</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <TrendingDown className="w-8 h-8 text-blue mx-auto mb-3" />
              <h3 className="font-syne font-700 text-text-1 mb-2">Subscription Analytics</h3>
              <p className="text-sm text-text-3">Detailed retention cohorts, LTV projections, and churn analysis available in the full subscription analytics report.</p>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
