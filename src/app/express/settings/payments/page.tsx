"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  Star,
  MapPin,
  Save,
  X,
  Shield,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
  cardType: "visa" | "mastercard" | "amex";
}

export default function PaymentsSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const [cards, setCards] = useState<PaymentMethod[]>([
    { id: "1", brand: "Visa", last4: "1234", expiry: "12/27", isDefault: true, cardType: "visa" },
    { id: "2", brand: "Mastercard", last4: "5678", expiry: "06/28", isDefault: false, cardType: "mastercard" },
  ]);

  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    line1: "22 Allen Avenue",
    line2: "Suite 12, Ikeja",
    city: "Lagos",
    state: "Lagos",
    postalCode: "100001",
    country: "Nigeria",
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 16);
    const parts = v.match(/.{1,4}/g);
    return parts ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2);
    }
    return v;
  };

  const getCardBrand = (number: string): "visa" | "mastercard" | "amex" => {
    const n = number.replace(/\D/g, "");
    if (n.startsWith("4")) return "visa";
    if (n.startsWith("5") || n.startsWith("2")) return "mastercard";
    return "amex";
  };

  const getBrandColor = (type: string) => {
    switch (type) {
      case "visa":
        return "bg-blue-600";
      case "mastercard":
        return "bg-red-500";
      case "amex":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  const setDefaultCard = (id: string) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === id,
      }))
    );
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const addCard = () => {
    if (newCard.number.replace(/\D/g, "").length < 12) return;
    const brand = getCardBrand(newCard.number);
    const last4 = newCard.number.replace(/\D/g, "").slice(-4);
    setCards((prev) => [
      ...prev.map((c) => ({ ...c, isDefault: false })),
      {
        id: Date.now().toString(),
        brand: brand.charAt(0).toUpperCase() + brand.slice(1),
        last4,
        expiry: newCard.expiry,
        isDefault: true,
        cardType: brand,
      },
    ]);
    setNewCard({ number: "", expiry: "", cvv: "", name: "" });
    setShowAddCard(false);
  };

  const handleSave = async () => {
    try {
      await fetch("/api/v1/express/settings/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards, billingAddress }),
      });
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Payment Methods</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your cards and billing information</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle size={16} className="text-emerald-500" />
          <span className="text-emerald-700 text-sm font-medium">Payment settings saved successfully</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <CreditCard size={20} className="text-[#FF6B00]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Saved Cards</h2>
              <p className="text-xs text-gray-500">Your saved payment methods</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#e55f00] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            Add Card
          </button>
        </div>

        <div className="space-y-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                card.isDefault
                  ? "border-[#FF6B00]/30 bg-[#FF6B00]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-14 h-10 rounded-lg ${getBrandColor(card.cardType)} flex items-center justify-center`}
              >
                <CreditCard size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#0A1628]">{card.brand}</p>
                  {card.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/10 text-[#FF6B00]">
                      <Star size={10} />
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  **** **** **** {card.last4} &bull; Expires {card.expiry}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!card.isDefault && (
                  <button
                    onClick={() => setDefaultCard(card.id)}
                    className="text-xs text-gray-500 hover:text-[#FF6B00] font-medium transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => removeCard(card.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddCard && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Plus size={20} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A1628]">Add New Card</h2>
                <p className="text-xs text-gray-500">Enter your card details</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddCard(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Card Number</label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={newCard.expiry}
                onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">CVV</label>
              <div className="relative">
                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Cardholder Name</label>
              <input
                type="text"
                placeholder="Name on card"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={addCard}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e55f00] text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={14} />
              Add Card
            </button>
            <button
              onClick={() => setShowAddCard(false)}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <MapPin size={20} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Billing Address</h2>
            <p className="text-xs text-gray-500">Address linked to your payment methods</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Address Line 1</label>
            <input
              type="text"
              value={billingAddress.line1}
              onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Address Line 2</label>
            <input
              type="text"
              value={billingAddress.line2}
              onChange={(e) => setBillingAddress({ ...billingAddress, line2: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">City</label>
            <input
              type="text"
              value={billingAddress.city}
              onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">State / Province</label>
            <input
              type="text"
              value={billingAddress.state}
              onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Postal Code</label>
            <input
              type="text"
              value={billingAddress.postalCode}
              onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Country</label>
            <select
              value={billingAddress.country}
              onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent appearance-none bg-white"
            >
              <option>Nigeria</option>
              <option>Ghana</option>
              <option>Kenya</option>
              <option>South Africa</option>
              <option>United Kingdom</option>
              <option>United States</option>
              <option>United Arab Emirates</option>
              <option>India</option>
              <option>Australia</option>
              <option>Germany</option>
              <option>France</option>
              <option>Canada</option>
              <option>Japan</option>
              <option>Brazil</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e55f00] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={14} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
