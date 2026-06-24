"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: "", contactPerson: "", email: "", phone: "",
    city: "", state: "", country: "Nigeria", categories: "",
    deliveryMethod: "", minOrderValue: "", bankName: "",
    bankAccount: "", bankAccountName: "", password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/v1/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          contactPerson: form.contactPerson,
          email: form.email,
          phone: form.phone,
          city: form.city,
          state: form.state,
          country: form.country,
          categories: form.categories ? form.categories.split(",").map(c => c.trim()) : [],
          deliveryMethod: form.deliveryMethod,
          minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
          bankName: form.bankName,
          bankAccount: form.bankAccount,
          bankAccountName: form.bankAccountName,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Registration failed");
      }
      router.push("/supplier/login?registered=true");
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] to-[#1a2a4a] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0A1628]">Become a Kauvex Supplier</h1>
          <p className="text-gray-500 mt-2">Supply products to millions of Kauvex customers</p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-[#FF6B00]' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#0A1628]">Business Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Business Name *</label>
                <input value={form.businessName} onChange={e => update('businessName', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Contact Person *</label>
                <input value={form.contactPerson} onChange={e => update('contactPerson', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password *</label>
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} className="bg-[#FF6B00] hover:bg-[#e86000]">Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#0A1628]">Location & Coverage</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Country</label>
                <select value={form.country} onChange={e => update('country', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#FF6B00]">
                  <option>Nigeria</option><option>Ghana</option><option>Kenya</option>
                  <option>South Africa</option><option>UAE</option><option>UK</option><option>USA</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">State</label>
                <input value={form.state} onChange={e => update('state', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">City</label>
                <input value={form.city} onChange={e => update('city', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Delivery Method</label>
                <select value={form.deliveryMethod} onChange={e => update('deliveryMethod', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#FF6B00]">
                  <option value="">Select...</option>
                  <optgroup label="Own Resources">
                    <option value="own_rider">Own Rider</option>
                    <option value="own_account">Own Account Carrier</option>
                  </optgroup>
                  <optgroup label="Kauvex Network">
                    <option value="kauvex_logistics">Kauvex Logistics Network</option>
                  </optgroup>
                  <optgroup label="Domestic Couriers">
                    <option value="dhl">DHL Express</option>
                    <option value="fedex">FedEx</option>
                    <option value="aramex">Aramex</option>
                    <option value="gig">GIG Logistics</option>
                    <option value="kwik">Kwik Delivery</option>
                    <option value="local">Local Delivery</option>
                  </optgroup>
                  <optgroup label="International">
                    <option value="dhl-international">DHL International</option>
                    <option value="fedex-international">FedEx International</option>
                    <option value="aramex-international">Aramex International</option>
                    <option value="freight-forwarder">Kauvex Freight Forwarder</option>
                  </optgroup>
                  <option value="other">Other Courier</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Product Categories (comma separated)</label>
                <input value={form.categories} onChange={e => update('categories', e.target.value)}
                  placeholder="FMCG, Beverages, Packaged Foods, etc."
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} className="bg-[#FF6B00] hover:bg-[#e86000]">Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#0A1628]">Bank Details for Payouts</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                <input value={form.bankName} onChange={e => update('bankName', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Account Number</label>
                <input value={form.bankAccount} onChange={e => update('bankAccount', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Account Name</label>
                <input value={form.bankAccountName} onChange={e => update('bankAccountName', e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
            </div>
            {submitError && (
              <div className="bg-red-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-blue-800">
                By registering, you agree to Kauvex&apos;s Supplier Terms. Your application will be reviewed
                within 1-2 business days. You&apos;ll receive login credentials via email once approved.
              </p>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>Back</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#FF6B00] hover:bg-[#e86000]">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-8">
          Already registered? <Link href="/supplier/login" className="text-[#FF6B00] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
