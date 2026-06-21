"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Save, Check, Minus, Plus, Globe, ArrowLeft,
  Package, Loader2, AlertCircle,
} from "lucide-react";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

const conditions = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Used - Like New" },
  { value: "good", label: "Used - Good" },
  { value: "acceptable", label: "Used - Acceptable" },
  { value: "refurbished", label: "Refurbished" },
  { value: "collectible", label: "Collectible" },
];

const fulfillmentTypes = [
  { value: "merchant", label: "Merchant Fulfilled" },
  { value: "fbk", label: "FBK (Kauvex Fulfilled)" },
];

type Storefront = {
  id: string;
  name: string;
  slug: string;
  currencyCode: string;
  currencySymbol: string;
};

type OfferRow = {
  storefrontId: string;
  storefrontName: string;
  currencyCode: string;
  currencySymbol: string;
  quantity: number;
  yourPrice: number;
  lowestPrice: number | null;
  checked: boolean;
};

const currencySymbolMap: Record<string, string> = {
  USD: "$", NGN: "\u20A6", GBP: "\u00A3", CAD: "C$", AUD: "A$", AED: "\u062F.\u0625",
  EUR: "\u20AC", JPY: "\u00A5", CNY: "\u00A5", INR: "\u20B9", BRL: "R$", KRW: "\u20A9",
};

export default function ProductOfferPage() {
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<{ title: string; masterProductId: string } | null>(null);
  const [sellerSku, setSellerSku] = useState("");
  const [yourPrice, setYourPrice] = useState<number>(0);
  const [condition, setCondition] = useState("new");
  const [fulfillment, setFulfillment] = useState("merchant");
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [existingOfferId, setExistingOfferId] = useState<string | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: authError } = await insforge.auth.getCurrentUser();
      if (authError || !user) {
        setError("You must be logged in.");
        return;
      }

      const { data: prod, error: prodErr } = await insforge.database
        .from("shared_catalog_products")
        .select("id, title, master_product_id")
        .eq("id", productId)
        .single();

      if (prodErr || !prod) {
        setError("Product not found.");
        return;
      }
      setProduct(prod);

      const { data: storefrontData } = await insforge.database
        .from("storefronts")
        .select("id, name, slug, currency_code, currency_symbol")
        .eq("status", "active")
        .order("name", { ascending: true });

      const sfList: Storefront[] = (storefrontData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        currencyCode: s.currency_code,
        currencySymbol: s.currency_symbol || currencySymbolMap[s.currency_code] || "$",
      }));
      setStorefronts(sfList);

      const { data: existing } = await insforge.database
        .from("vendor_offers")
        .select("id, price, currency, inventory, condition, fulfillment_type, is_active")
        .eq("shared_product_id", productId)
        .eq("vendor_id", user.id)
        .maybeSingle();

      if (existing) {
        setExistingOfferId(existing.id);
        setYourPrice(Number(existing.price));
        setCondition(existing.condition || "new");
        setFulfillment(existing.fulfillment_type || "merchant");
      }

      const { data: allOffers } = await insforge.database
        .from("vendor_offers")
        .select("price, currency")
        .eq("shared_product_id", productId)
        .eq("is_active", true);

      const lowestByCurrency: Record<string, number> = {};
      (allOffers || []).forEach((o: any) => {
        const p = Number(o.price);
        if (!lowestByCurrency[o.currency] || p < lowestByCurrency[o.currency]) {
          lowestByCurrency[o.currency] = p;
        }
      });

      const initialOffers: OfferRow[] = sfList.map((sf) => ({
        storefrontId: sf.id,
        storefrontName: sf.name,
        currencyCode: sf.currencyCode,
        currencySymbol: sf.currencySymbol,
        quantity: existing?.inventory ?? 0,
        yourPrice: existing ? Number(existing.price) : 0,
        lowestPrice: lowestByCurrency[sf.currencyCode] ?? null,
        checked: sf.slug === "global",
      }));
      setOffers(initialOffers);
    } catch (e: any) {
      console.error("Offer page fetch error:", e);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCheck = (storefrontId: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.storefrontId === storefrontId ? { ...o, checked: !o.checked } : o,
      ),
    );
  };

  const toggleAll = () => {
    const allChecked = offers.every((o) => o.checked);
    setOffers((prev) => prev.map((o) => ({ ...o, checked: !allChecked })));
  };

  const matchLowestPrice = async () => {
    try {
      const { data: allOffers } = await insforge.database
        .from("vendor_offers")
        .select("price, currency")
        .eq("shared_product_id", productId)
        .eq("is_active", true);

      const lowestByCurrency: Record<string, number> = {};
      (allOffers || []).forEach((o: any) => {
        const p = Number(o.price);
        if (!lowestByCurrency[o.currency] || p < lowestByCurrency[o.currency]) {
          lowestByCurrency[o.currency] = p;
        }
      });

      let matchedAny = false;
      setOffers((prev) =>
        prev.map((o) => {
          const lp = lowestByCurrency[o.currencyCode];
          if (o.checked && lp != null && lp < o.yourPrice) {
            matchedAny = true;
            return { ...o, yourPrice: lp };
          }
          return o;
        }),
      );

      if (matchedAny) {
        const minGlobal = Math.min(
          ...offers
            .filter((o) => o.checked)
            .map((o) => lowestByCurrency[o.currencyCode] ?? Infinity),
        );
        if (isFinite(minGlobal)) setYourPrice(minGlobal);
      }

      showToast("success", "Prices matched to lowest competitor prices");
    } catch {
      showToast("error", "Failed to fetch lowest prices");
    }
  };

  const matchRowPrice = (storefrontId: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.storefrontId === storefrontId && o.lowestPrice != null) {
          return { ...o, yourPrice: o.lowestPrice };
        }
        return o;
      }),
    );
    showToast("success", "Price matched for this storefront");
  };

  const updateOfferPrice = (storefrontId: string, price: number) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.storefrontId === storefrontId ? { ...o, yourPrice: price } : o,
      ),
    );
  };

  const updateOfferQty = (storefrontId: string, qty: number) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.storefrontId === storefrontId
          ? { ...o, quantity: Math.max(0, qty) }
          : o,
      ),
    );
  };

  const handleSave = async () => {
    const checkedStorefronts = offers.filter((o) => o.checked);
    if (checkedStorefronts.length === 0) {
      showToast("error", "Select at least one storefront");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) {
        showToast("error", "Not authenticated");
        return;
      }

      const defaultOffer = checkedStorefronts[0];

      const payload = {
        shared_product_id: productId,
        vendor_id: user.id,
        price: defaultOffer.yourPrice,
        currency: defaultOffer.currencyCode,
        inventory: defaultOffer.quantity,
        condition,
        fulfillment_type: fulfillment,
        is_active: true,
      };

      if (existingOfferId) {
        const { error: updateErr } = await insforge.database
          .from("vendor_offers")
          .update(payload)
          .eq("id", existingOfferId);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await insforge.database
          .from("vendor_offers")
          .insert(payload);

        if (insertErr) throw insertErr;
        setExistingOfferId("pending");
      }

      showToast("success", `Offer published to ${checkedStorefronts.length} storefront(s)`);
    } catch (e: any) {
      console.error("Save offer error:", e);
      showToast("error", e?.message || "Failed to save offer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <VendorShell title="Create Offer" subtitle="Loading...">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-text-4" />
        </div>
      </VendorShell>
    );
  }

  if (error) {
    return (
      <VendorShell title="Create Offer" subtitle={`Product ID: ${productId}`}>
        <div className="max-w-5xl mx-auto">
          <Link href={`/vendor/products/${productId}/edit`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-4 hover:text-text-1 transition-colors mb-6">
            <ArrowLeft size={13} /> Back to Product
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </VendorShell>
    );
  }

  const checkedCount = offers.filter((o) => o.checked).length;
  const allChecked = checkedCount === offers.length;

  return (
    <VendorShell title="Create Offer" subtitle={product?.title || `Product ID: ${productId}`}>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href={`/vendor/products/${productId}/edit`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-4 hover:text-text-1 transition-colors"
        >
          <ArrowLeft size={13} /> Back to Product
        </Link>

        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-text-1">Offer Settings</h3>
            <button
              onClick={matchLowestPrice}
              className="flex items-center gap-1.5 px-4 h-9 bg-orange/10 text-orange text-xs font-bold rounded-xl hover:bg-orange/20 transition-colors"
            >
              <Minus size={13} /> Match Lowest Price
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Seller SKU</label>
              <input
                value={sellerSku}
                onChange={(e) => setSellerSku(e.target.value)}
                placeholder="Your custom SKU"
                className="w-full h-10 px-3 border border-border rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">
                Your Price ({offers.find((o) => o.checked)?.currencyCode || "USD"})
              </label>
              <input
                type="number"
                step="0.01"
                value={yourPrice}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setYourPrice(val);
                  setOffers((prev) =>
                    prev.map((o) => (o.checked ? { ...o, yourPrice: val } : o)),
                  );
                }}
                className="w-full h-10 px-3 border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Item Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white"
              >
                {conditions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Fulfillment Channel</label>
              <select
                value={fulfillment}
                onChange={(e) => setFulfillment(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white"
              >
                {fulfillmentTypes.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text-1">Storefront Offers</h3>
              <p className="text-xs text-text-4 mt-0.5">
                Configure pricing per storefront. Checked storefronts will be published.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-text-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="rounded"
                />
                {allChecked ? "Deselect All" : "Select All"}
              </label>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Storefront</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Currency</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Quantity</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Your Price</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Current Lowest</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr
                  key={o.storefrontId}
                  className={`border-b border-border hover:bg-gray-50/50 transition-colors ${o.checked ? "" : "opacity-50"}`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={o.checked}
                      onChange={() => toggleCheck(o.storefrontId)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Globe size={13} className="text-text-4" />
                      <span className="font-medium text-text-1">{o.storefrontName}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-mono font-semibold text-text-3">{o.currencyCode}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateOfferQty(o.storefrontId, o.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={o.quantity}
                        onChange={(e) => updateOfferQty(o.storefrontId, Number(e.target.value) || 0)}
                        className="w-16 h-8 text-center text-xs border border-border rounded-lg"
                      />
                      <button
                        onClick={() => updateOfferQty(o.storefrontId, o.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.01"
                      value={o.yourPrice}
                      onChange={(e) => updateOfferPrice(o.storefrontId, Number(e.target.value) || 0)}
                      className="w-24 h-8 px-2 text-xs border border-border rounded-lg font-mono"
                    />
                  </td>
                  <td className="p-3">
                    {o.lowestPrice != null ? (
                      <span className="text-sm font-semibold text-red-600 font-mono">
                        {o.currencySymbol || currencySymbolMap[o.currencyCode] || "$"}
                        {o.lowestPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-text-4">N/A</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => matchRowPrice(o.storefrontId)}
                      disabled={o.lowestPrice == null}
                      className="flex items-center gap-1 px-2.5 h-7 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-40"
                    >
                      <Minus size={11} /> Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center">
              <Package size={16} className="text-orange" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-1">
                Publishing to {checkedCount} storefront{checkedCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-text-4">Offer will be live once published</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || checkedCount === 0}
            className="flex items-center gap-2 px-6 h-10 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Publishing..." : "Save and Publish"}
          </button>
        </div>
      </div>
    </VendorShell>
  );
}
