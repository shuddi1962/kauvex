import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kauvex Express — FAQ",
  description: "Frequently asked questions about Kauvex Express courier service, waybills, tracking, pricing, and international shipping.",
};

const faqs = [
  {
    q: "What is Kauvex Express?",
    a: "Kauvex Express is a standalone courier service open to anyone — no marketplace account required. We handle local same-day, domestic intercity, and international shipping via our logistics network and trusted carrier partners (DHL, FedEx, Aramex).",
  },
  {
    q: "How is a waybill different from a shipping label?",
    a: "A waybill is the formal document used for Kauvex Express shipments. It serves as the contract of carriage and includes sender/receiver details, contents description, declared value, and proof of delivery fields. Marketplace orders use shipping labels — Express bookings use waybills.",
  },
  {
    q: "What areas do you deliver to?",
    a: "We deliver to all 36 states in Nigeria (including FCT) for domestic shipping, and to over 50 countries internationally via our carrier partners. Enter your destination in the quote calculator to check coverage for your specific route.",
  },
  {
    q: "How fast is delivery?",
    a: "Same-day delivery is available within the same city for bookings made before 2 PM. Standard domestic delivery is 1-3 business days depending on the route. International express (DHL/FedEx) takes 3-5 business days; economy takes 7-14 days.",
  },
  {
    q: "How do I track my shipment?",
    a: "Enter your waybill number on the tracking page at kauvex.com/express/track. No login required. You will see real-time updates across every leg of the journey — from pickup to delivery.",
  },
  {
    q: "What does 'Pack For Me' mean?",
    a: "If your item is unpacked or poorly packed, drop it off at a Kauvex hub and our team will professionally pack it for you. Packing materials and labour are included in the service fee. Photos are taken before sealing for your protection.",
  },
  {
    q: "Can I ship internationally?",
    a: "Yes. We ship to 50+ countries via DHL Express International, FedEx International, and Aramex International. Import duties and taxes are estimated upfront at checkout. You can also upgrade to DDP (Delivered Duty Paid) to avoid surprise charges on arrival.",
  },
  {
    q: "What items are restricted or prohibited?",
    a: "Weapons, explosives, illegal drugs, counterfeit goods, live animals, and human remains are globally prohibited. Some countries have additional restrictions on electronics, food items, or pharmaceuticals. The system will block prohibited items at checkout and show a clear reason.",
  },
  {
    q: "How is the shipping price calculated?",
    a: "The price is based on the origin and destination, package weight and dimensions, service level (economy/standard/express), and declared value. Dimensional weight is also calculated — the greater of actual weight vs dimensional weight is used for pricing.",
  },
  {
    q: "Is insurance available?",
    a: "Yes. Shipment insurance is available at 1.5% of the declared value. For high-value shipments (above ₦100,000), insurance is mandatory. All shipments are protected by Kauvex Buyer Protection regardless.",
  },
  {
    q: "What is Express for Business?",
    a: "Express for Business gives companies volume discounts, team accounts, bulk CSV upload, API access for system integration, custom waybill branding, and a dedicated account manager for high-volume shippers. Visit kauvex.com/express/business for details.",
  },
  {
    q: "Can I become a delivery partner?",
    a: "Yes. Register as an independent rider, driver, courier business, or freight company at kauvex.com/logistics/dashboard. You earn 70-80% of the delivery fee and get higher payouts as you progress through our partner tier system.",
  },
  {
    q: "What happens if my package is lost or damaged?",
    a: "Kauvex Buyer Protection covers every shipment. If your package is lost or damaged, file a claim and we will make you whole immediately — up to the declared value. We recover costs from the delivery partner or carrier through our liability framework.",
  },
  {
    q: "How do I cancel or modify a booking?",
    a: "If the shipment has not been picked up yet, contact our support team to cancel or modify the booking. Once picked up, changes may incur additional fees. Same-day cancellations before pickup are fully refunded.",
  },
];

export default function ExpressFaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1628] mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 mb-10">Everything you need to know about Kauvex Express.</p>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                <span className="font-semibold text-sm text-[#0A1628]">{faq.q}</span>
                <svg className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-gray-50 rounded-2xl">
          <h2 className="font-bold text-[#0A1628] mb-2">Still have questions?</h2>
          <p className="text-sm text-gray-500 mb-4">Our support team is available 24/7 to help you.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 h-10 bg-[#FF6B00] text-white text-sm font-bold rounded-xl hover:bg-[#FF6B00]/90 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
