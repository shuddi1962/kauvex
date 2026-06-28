"use client";

import { useState } from "react";
import { HelpCircle, Search, MessageSquare, Book, Video, ChevronDown, ChevronRight, ExternalLink, Mail, Phone, Clock } from "lucide-react";

const FAQ = [
  { q: "How do I create a shipment?", a: "Click 'Get a Quote' in the sidebar, fill in origin/destination details, select a carrier, and confirm. Your waybill will be generated instantly." },
  { q: "How do I track a shipment?", a: "Go to 'Shipments' and click on any shipment, or use the 'Tracking' page to enter your waybill number." },
  { q: "How do I schedule a pickup?", a: "Navigate to 'Pickups' and click 'Schedule Pickup'. Select your address, choose a time slot, and confirm." },
  { q: "Can I change the carrier after creating a shipment?", a: "Yes, as long as the shipment hasn't been picked up yet. Edit the shipment and select a different carrier." },
  { q: "How do I connect my Shopify store?", a: "Go to 'Platforms', click 'Connect Platform', select Shopify, and authorize the Kauvex app." },
  { q: "How do I set up shipping rules?", a: "Navigate to 'Shipping Rules' and create rules based on destination, weight, value, or service type." },
  { q: "How do I print shipping labels?", a: "Go to 'Printing', connect your thermal printer, and enable auto-print. Labels print automatically when you create a shipment." },
  { q: "How do I integrate via API?", a: "Go to 'API & Webhooks' to generate API keys. Full documentation is available at docs.kauvex.com/api." },
];

const RESOURCES = [
  { icon: Book, title: "Documentation", description: "Complete guides and API references", href: "https://docs.kauvex.com" },
  { icon: Video, title: "Video Tutorials", description: "Step-by-step video walkthroughs", href: "#" },
  { icon: MessageSquare, title: "Live Chat", description: "Chat with our support team", href: "#" },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaq = FAQ.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Help & Support</h1>
        <p className="text-gray-500 text-sm mt-1">Find answers, get support, and learn how to use Kauvex Express</p>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search for help..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {RESOURCES.map((r) => (
          <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <r.icon className="w-8 h-8 text-[#FF6B00] mb-3" />
            <h3 className="text-sm font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{r.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{r.description}</p>
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#0A1628]">Frequently Asked Questions</h2>
        </div>
        <div>
          {filteredFaq.map((faq, i) => (
            <div key={i} className="border-b border-gray-50 last:border-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-[#0A1628]">{faq.q}</span>
                {openFaq === i ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 ml-7">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-[#0A1628] mb-4">Contact Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Mail className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-[#0A1628]">support@kauvex.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Phone className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-[#0A1628]">+234 800 123 4567</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Clock className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <p className="text-xs text-gray-500">Hours</p>
              <p className="text-sm font-medium text-[#0A1628]">Mon–Sat 8AM–8PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
