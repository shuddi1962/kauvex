"use client";

import { useState } from "react";
import { CreditCard, Plus, Trash2, CheckCircle2, Shield } from "lucide-react";

const PAYMENT_METHODS = [
  { id: 1, type: "visa", last4: "4242", expiry: "12/27", name: "John Doe", default: true },
  { id: 2, type: "mastercard", last4: "8888", expiry: "06/26", name: "John Doe", default: false },
  { id: 3, type: "bank", last4: "0123", bank: "GTBank", name: "Doe Business Ltd", default: false },
];

const ICONS: Record<string, string> = { visa: "💳", mastercard: "💳", bank: "🏦" };

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState(PAYMENT_METHODS);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Payment Methods</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your saved payment methods</p>
        </div>
        <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Add Method
        </button>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Your payment info is secure</p>
          <p className="text-xs text-blue-700 mt-0.5">All payment details are encrypted and stored securely. We never share your financial data.</p>
        </div>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <div key={method.id} className={`bg-white rounded-xl border p-5 ${method.default ? "border-[#FF6B00]/30" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{ICONS[method.type]}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0A1628] capitalize">{method.type === "bank" ? method.bank : method.type}</span>
                    <span className="text-sm text-gray-400">•••• {method.last4}</span>
                    {method.default && <span className="text-[10px] bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full font-medium">DEFAULT</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{method.name}</span>
                    {method.expiry && <span className="text-xs text-gray-400">· Expires {method.expiry}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!method.default && (
                  <button className="text-xs text-[#FF6B00] hover:text-[#e55f00] font-medium px-2 py-1 rounded-lg hover:bg-[#FF6B00]/5">Set Default</button>
                )}
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
