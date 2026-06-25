"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, Check, X, ArrowUp, ArrowDown, AlertTriangle, Clock, Package, Users, Store, BarChart3, RefreshCw, Ban, Loader2, DollarSign, Wallet, AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [plans, setPlans] = useState<any[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState<any>(null);
  const [fbkBilling, setFbkBilling] = useState<any>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch subscription from API
      const subRes = await fetch("/api/vendor/subscription");
      let subscription = null;
      if (subRes.ok) {
        const data = await subRes.json();
        subscription = data.subscription || null;
      }

      // Fetch vendor plans from API
      const plansRes = await fetch("/api/vendor/plans");
      let allPlans: any[] = [];
      if (plansRes.ok) {
        const data = await plansRes.json();
        allPlans = data.plans || [];
      }

      setPlans(allPlans);

      if (subscription) {
        setCurrentPlan(subscription);

        // Fetch FBK billing info
        const fbkRes = await fetch("/api/v1/fbk/billing");
        if (fbkRes.ok) {
          const fbkData = await fbkRes.json();
          setFbkBilling(fbkData.data || null);
        }

        // Fetch wallet balance
        const walletRes = await fetch("/api/v1/wallet/my");
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.data?.balance || 0);
        }
      } else {
        // User has no subscription - show default plan
        const freePlan = allPlans.find((p) => p.slug === "free");
        if (freePlan) {
          const planFeatures = freePlan.features
            ? typeof freePlan.features === "string"
              ? JSON.parse(freePlan.features)
              : freePlan.features
            : [];

          const planWithFeatures = {
            id: freePlan.id,
            slug: freePlan.slug,
            name: freePlan.name,
            description: freePlan.description,
            monthly_price: freePlan.monthly_price,
            annual_price: freePlan.annual_price,
            currency: freePlan.currency,
            commission_rate: freePlan.commission_rate,
            max_products: freePlan.max_products,
            max_storefronts: freePlan.max_storefronts,
            max_staff: freePlan.max_staff,
            allows_subdomain: freePlan.allows_subdomain,
            allows_custom_domain: freePlan.allows_custom_domain,
            allows_fbk: freePlan.allows_fbk,
            allows_ads: freePlan.allows_ads,
            allows_api: freePlan.allows_api,
            allows_white_label: freePlan.allows_white_label,
            allows_b2b: freePlan.allows_b2b,
            analytics_level: freePlan.analytics_level,
            support_level: freePlan.support_level,
            features: planFeatures,
            sort_order: freePlan.sort_order,
            is_active: freePlan.is_active,
          };

          setCurrentPlan({
            id: freePlan.id,
            slug: freePlan.slug,
            name: freePlan.name,
            price: Number(freePlan.monthly_price || 0),
            currency: freePlan.currency,
            interval: "monthly",
            status: "active",
            currentPeriodStart: new Date().toISOString().split("T")[0],
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            cancelAtPeriodEnd: false,
            plan: planWithFeatures,
            monthlyPrice: Number(freePlan.monthly_price || 0),
            annualPrice: Number(freePlan.annual_price || 0),
            billingCycle: "monthly",
            features: planFeatures,
          });
        }

        // Fetch FBK billing info
        const fbkRes = await fetch("/api/v1/fbk/billing");
        if (fbkRes.ok) {
          const fbkData = await fbkRes.json();
          setFbkBilling(fbkData.data || null);
        }

        // Fetch wallet balance
        const walletRes = await fetch("/api/v1/wallet/my");
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.data?.balance || 0);
        }
      }
    } catch (err) {
      setError("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (targetPlan: any) => {
    if (!currentPlan) return;

    const price = targetPlan.slug === "annual" ? targetPlan.annual_price : targetPlan.monthly_price;
    const isUpgrade = targetPlan.monthly_price > currentPlan.price;

    if (price > 0) {
      const walletBalance = parseFloat(walletBalance || "0");
      if (walletBalance < price) {
        setError(`Insufficient wallet balance. You need $${price}. Please deposit funds.`);
        return;
      }
    }

    setShowUpgradeConfirm({ plan: targetPlan, price, isUpgrade });
  };

  const confirmUpgrade = async () => {
    if (!showUpgradeConfirm) return;

    setProcessing(showUpgradeConfirm.plan.id);
    setError(null);

    try {
      const payload = {
        vendor_id: "current-vendor-id",
        plan_id: showUpgradeConfirm.plan.id,
        billing_cycle: "monthly",
      };

      const response = await fetch("/api/vendor/subscription", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upgrade plan");
      }

      await loadData();

      setShowUpgradeConfirm(null);
    } catch (err: any) {
      setError(err.message || "Upgrade failed");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <VendorShell title="Subscription & Plans" subtitle="Manage your vendor plan and billing">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </VendorShell>
    );
  }

  if (error) {
    return (
      <VendorShell title="Subscription & Plans" subtitle="Manage your vendor plan and billing">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Subscription</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">Retry</Button>
          </div>
        </div>
      </VendorShell>
    );
  }

  return (
    <VendorShell title="Subscription & Plans" subtitle="Manage your vendor plan and billing">
      <div className="max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p className="text-xs">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">Current Plan</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${currentPlan?.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{currentPlan?.status || "inactive"}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {currentPlan?.name || "Free"} Plan · ${currentPlan?.price || 0}/{currentPlan?.interval || "month"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
                    <Wallet size={12} /> Wallet Balance
                  </div>
                  <p className="text-lg font-bold text-gray-900">${walletBalance.toFixed(2)}</p>
                  <Link href="/vendor/wallet" className="text-[10px] text-purple-600 hover:underline">Top Up</Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> Period Start
                  </p>
                  <p className="text-xs font-semibold mt-0.5">{currentPlan?.currentPeriodStart || "N/A"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> Period End
                  </p>
                  <p className="text-xs font-semibold mt-0.5">{currentPlan?.currentPeriodEnd || "N/A"}</p>
                </div>
              </div>

              {currentPlan?.cancelAtPeriodEnd && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Subscription Cancelled</p>
                    <p className="text-[10px] text-amber-700">
                      Your plan will expire on {currentPlan?.currentPeriodEnd}. You can reinstate before then.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
              <h3 className="font-semibold text-sm mb-4">Available Plans</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const isCurrent = currentPlan?.id === plan.id;
                  const planFeatures = plan.features ? (typeof plan.features === "string" ? JSON.parse(plan.features) : plan.features) : [];
                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl border-2 p-5 transition-all ${plan.popular ? "border-purple-600 shadow-lg shadow-purple-100" : isCurrent ? "border-purple-400 bg-purple-50/50" : "border-gray-200"}`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-purple-600 text-white px-3 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${plan.color === "purple" ? "bg-purple-100" : plan.color === "amber" ? "bg-amber-100" : "bg-gray-100"}`}>
                          <DollarSign size={16} className={plan.color === "purple" ? "text-purple-600" : plan.color === "amber" ? "text-amber-600" : "text-gray-500"} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{plan.name}</p>
                          <p className="text-lg font-bold">
                            ${plan.monthly_price || 0}
                            <span className="text-xs font-normal text-gray-400">/mo</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-4">{plan.description}</p>
                      <div className="space-y-2 mb-5">
                        {planFeatures.map((feature: any) => (
                          <div key={feature.name} className="flex items-center gap-2">
                            {feature.included ? (
                              <Check size={12} className="text-green-500 shrink-0" />
                            ) : (
                              <X size={12} className="text-gray-300 shrink-0" />
                            )}
                            <span className={`text-[11px] ${feature.included ? "text-gray-700" : "text-gray-400"}`}>{feature.name}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                        className={`w-full text-xs ${plan.popular && !isCurrent ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                        onClick={() => !isCurrent && handleUpgrade(plan)}
                        disabled={isCurrent || processing === plan.id}
                      >
                        {processing === plan.id ? (
                          <Loader2 size={14} className="mr-1 animate-spin" />
                        ) : isCurrent ? (
                          "Current Plan"
                        ) : plan.monthly_price === 0 ? (
                          "Downgrade"
                        ) : currentPlan?.price < plan.monthly_price ? (
                          <><ArrowUp size={12} className="mr-1" /> Upgrade</>
                        ) : (
                          <><ArrowDown size={12} className="mr-1" /> Downgrade</>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full text-xs" disabled>
                  <Clock size={14} className="mr-1" /> Next Billing
                </Button>
                {currentPlan?.cancelAtPeriodEnd ? (
                  <Button variant="outline" className="w-full text-xs" onClick={() => {}} disabled>
                    <RefreshCw size={14} className="mr-1" /> Reinstate Plan
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowCancelConfirm(true)}>
                    <Ban size={14} className="mr-1" /> Cancel Subscription
                  </Button>
                )}
                <Button variant="outline" className="w-full text-xs">
                  <CreditCard size={14} className="mr-1" /> Payment Methods
                </Button>
                <Button variant="outline" className="w-full text-xs">
                  <DollarSign size={14} className="mr-1" /> Billing History
                </Button>
              </div>
            </div>

            {fbkBilling?.enrolled && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Layers size={16} className="text-purple-600" /> FBK Fee Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Monthly Subscription</span>
                    <span className="font-semibold">${(fbkBilling.fees?.monthlySubscription || 0).toFixed(2)} /month</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Storage Fee</span>
                    <span className="font-semibold">${(fbkBilling.fees?.storageFee || 0).toFixed(2)} /unit/month</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Pick and Pack Fee</span>
                    <span className="font-semibold">${(fbkBilling.fees?.pickPackFee || 0).toFixed(2)} /unit</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Units in Storage</span>
                      <span className="font-semibold">{fbkBilling.usage?.totalUnits || 0} units</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Storage Cost</span>
                      <span className="font-semibold">${((fbkBilling.usage?.totalUnits || 0) * (fbkBilling.fees?.storageFee || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Pick and Pack Cost</span>
                      <span className="font-semibold">${((fbkBilling.usage?.totalUnits || 0) * (fbkBilling.fees?.pickPackFee || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                  {(fbkBilling.outstandingDebt || 0) > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg mt-2">
                      <AlertTriangle size={12} className="text-red-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-red-700">Outstanding Debt</p>
                        <p className="text-[10px] text-red-600">${(fbkBilling.outstandingDebt || 0).toFixed(2)} — {fbkBilling.debtStatus}</p>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Estimated Total</span>
                      <span className="text-purple-600">${(fbkBilling.estimatedTotal || 0).toFixed(2)} this period</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-400">Wallet Balance</span>
                    <span className={`font-semibold ${walletBalance >= (fbkBilling.estimatedTotal || 0) ? "text-green-600" : "text-red-600"}`}>
                      ${walletBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Link href="/vendor/fbk">
                  <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                    <Layers size={12} className="mr-1" /> Manage FBK
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-purple-600" /> Billing History
          </h3>
          <div className="text-center py-8">
            <DollarSign size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No billing history yet</p>
            <p className="text-xs text-gray-300 mt-1">Your subscription charges will appear here once you upgrade</p>
          </div>
        </div>
      </div>

      {showUpgradeConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowUpgradeConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">Confirm Plan Upgrade</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Upgrade from <span className="font-bold">{currentPlan?.name}</span> (${currentPlan?.price}/mo) to <span className="font-bold">{showUpgradeConfirm.plan.name}</span> (${showUpgradeConfirm.price}/mo)
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span>Current Plan:</span>
                <span className="font-semibold">${currentPlan?.price}/mo</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>New Plan:</span>
                <span className="font-semibold">${showUpgradeConfirm.price}/mo</span>
              </div>
              {showUpgradeConfirm.isUpgrade && (
                <div className="flex items-center justify-between text-xs text-green-600">
                  <span>Price Difference:</span>
                  <span className="font-semibold">+${showUpgradeConfirm.price - currentPlan.price}</span>
                </div>
              )}
              {!showUpgradeConfirm.isUpgrade && (
                <div className="flex items-center justify-between text-xs text-red-600">
                  <span>Price Difference:</span>
                  <span className="font-semibold">-${currentPlan.price - showUpgradeConfirm.price}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeConfirm(null)} disabled={processing === showUpgradeConfirm.plan.id}>Cancel</Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={confirmUpgrade} disabled={processing === showUpgradeConfirm.plan.id}>
                {processing === showUpgradeConfirm.plan.id ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <>Upgrade to ${showUpgradeConfirm.price}/mo</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowCancelConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ban size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">Cancel Subscription?</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Your plan will remain active until the end of the current billing period. After that, your store will
              be downgraded to the Free plan.
            </p>
            <Button variant="destructive" className="w-full mb-2" onClick={() => {}} disabled={processing === "cancel"}>
              {processing === "cancel" ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : null}
              Yes, Cancel Plan
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowCancelConfirm(false)}>
              Keep Plan
            </Button>
          </div>
        </div>
      )}
    </VendorShell>
  );
}
