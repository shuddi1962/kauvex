import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kauvex Express — Terms of Service",
  description: "Terms and conditions for using Kauvex Express courier services, waybills, and international shipping.",
};

const sections = [
  {
    title: "1. Service Description",
    content: "Kauvex Express is a courier and logistics service operated by Kauvex Commerce Cloud. It provides domestic and international shipment services through independent network partners and established carrier APIs. Kauvex Express is a standalone service — a marketplace account is not required to use it.",
  },
  {
    title: "2. Definitions",
    content: "\"Waybill\" means the contract of carriage document issued for each Kauvex Express shipment. \"Sender\" means the person or entity booking the shipment. \"Receiver\" means the intended recipient. \"Partner\" means an independent rider, driver, or courier business registered on the Kauvex Logistics Network. \"Carrier\" means an established logistics company accessed via API (DHL, FedEx, Aramex).",
  },
  {
    title: "3. Booking & Payment",
    content: "All shipments require full payment before pickup. Payment can be made by card (via Paystack), bank transfer, USSD, or Kauvex Wallet for registered users. The sender must provide accurate shipment details including weight, dimensions, declared value, and contents description. Incorrect information may result in surcharges or service refusal.",
  },
  {
    title: "4. Prohibited Items",
    content: "The following items are prohibited: weapons and ammunition, explosives and flammable materials, illegal drugs and substances, counterfeit goods, live animals (except via specialist handlers), human remains, and currency above legal thresholds. Country-specific restrictions also apply. Kauvex Express reserves the right to inspect any package and refuse service for prohibited items.",
  },
  {
    title: "5. Liability & Insurance",
    content: "Standard liability for loss or damage is capped at the declared value or ₦100,000, whichever is lower, for uninsured shipments. Shipment insurance (1.5% of declared value) extends coverage to the full declared value. High-value shipments (above ₦100,000) require mandatory insurance. Kauvex Buyer Protection covers all shipments — customers are made whole immediately on valid claims.",
  },
  {
    title: "6. Delivery & Attempts",
    content: "Three delivery attempts are made before the shipment is returned to sender. Failed attempts may result from: receiver not available, incorrect address provided by sender, or refusal to accept delivery. Re-delivery may incur additional charges if the failure was due to incorrect address provided by the sender.",
  },
  {
    title: "7. Cancellation & Refunds",
    content: "Bookings cancelled before pickup are fully refunded. Bookings cancelled after pickup but before delivery are refunded minus a processing fee (₦500 or 10% of the shipping cost, whichever is higher). Bookings cancelled after delivery attempt are not refundable. Refunds are processed within 5-7 business days.",
  },
  {
    title: "8. International Shipping",
    content: "International shipments are subject to customs clearance in both origin and destination countries. Import duties, taxes, and customs fees are the responsibility of the receiver unless DDP (Delivered Duty Paid) is selected and paid at checkout. Kauvex Express provides estimated duties at checkout but cannot guarantee final amounts. Prohibited items vary by destination country — the system blocks non-compliant items at booking.",
  },
  {
    title: "9. Partner & Carrier Terms",
    content: "Domestic shipments may be fulfilled by independent partners of the Kauvex Logistics Network. International shipments are fulfilled by established carrier APIs only — never by independent partners. Kauvex is not responsible for delays caused by carrier operational issues, customs holds, weather events, or force majeure.",
  },
  {
    title: "10. Privacy & Data",
    content: "Sender and receiver personal data is used solely for shipment fulfilment, tracking, and customer support. Data is shared with delivery partners and carriers only to the extent necessary for delivery. We do not sell personal data to third parties. Full privacy policy available at kauvex.com/privacy.",
  },
  {
    title: "11. Amendments",
    content: "Kauvex reserves the right to amend these terms at any time. Changes will be posted on this page. Continued use of the service after changes constitutes acceptance of the updated terms.",
  },
];

export default function ExpressTermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1628] mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-2">Kauvex Express — Effective January 2026</p>
        <p className="text-sm text-gray-400 mb-10">
          These terms govern your use of Kauvex Express courier services. By booking a shipment, you agree to these terms.
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-[#0A1628] mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-2xl text-center">
          <p className="text-sm text-gray-500">
            Questions about these terms?{" "}
            <Link href="/express/faq" className="text-[#FF6B00] font-semibold hover:underline">
              Visit our FAQ
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="text-[#FF6B00] font-semibold hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
