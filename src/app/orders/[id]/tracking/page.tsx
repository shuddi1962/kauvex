"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Package, Truck, MapPin, CheckCircle2, XCircle, Clock, ChevronRight, Star, Phone, MessageCircle, Shield, Navigation, Loader2 } from "lucide-react";
import Link from "next/link";

interface TrackingEvent {
  status: string;
  label: string;
  date: string;
  completed: boolean;
  active: boolean;
}

interface ShipmentDetail {
  id: string;
  orderNumber: string;
  date: string;
  items: string[];
  total: string;
  storefront: string;
  deliveryPin: string;
  status: string;
  estimatedDelivery: string;
  carrier: string;
  trackingNumber: string;
  serviceLevel: string;
  weight: string;
  dimensions: string;
  packagingType: string;
  fulfillmentType: string;
  lastUpdated: string;
}

const fallbackTimeline: TrackingEvent[] = [
  { status: "picked", label: "Item picked from warehouse", date: "Mar 19, 10:30 AM", completed: true, active: false },
  { status: "packed", label: "Packed and ready for dispatch", date: "Mar 19, 11:15 AM", completed: true, active: false },
  { status: "picked_up", label: "Picked up by delivery partner", date: "Mar 19, 2:00 PM", completed: true, active: false },
  { status: "in_transit", label: "In transit to destination city", date: "Mar 19, 4:30 PM", completed: true, active: false },
  { status: "out_for_delivery", label: "Out for delivery", date: "Mar 20, 8:00 AM", completed: false, active: true },
  { status: "delivered", label: "Delivered", date: "—", completed: false, active: false },
];

const fallbackDetail: ShipmentDetail = {
  id: "KAU-3921",
  orderNumber: "KAU-3921",
  date: "March 18, 2024",
  items: ["Wireless Earbuds Pro", "Charging Cable"],
  total: "₦45,000",
  storefront: "Kauvex Nigeria",
  deliveryPin: "7284",
  status: "out_for_delivery",
  estimatedDelivery: "Today by 6PM",
  carrier: "Kauvex Logistics Network",
  trackingNumber: "KVX-TRK-8294-1",
  serviceLevel: "Express Same-Day",
  weight: "0.5 kg",
  dimensions: "15x10x5 cm",
  packagingType: "Kauvex Branded Box",
  fulfillmentType: "FBK",
  lastUpdated: "2 mins ago",
};

export default function OrderTrackingPage() {
  const params = useParams();
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ShipmentDetail>(fallbackDetail);
  const [timeline, setTimeline] = useState<TrackingEvent[]>(fallbackTimeline);

  useEffect(() => {
    const orderId = params.id as string;
    if (!orderId) return;

    fetch(`/api/v1/orders/${orderId}/tracking`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          const mappedDetail: ShipmentDetail = {
            id: data.order_id || orderId,
            orderNumber: data.order_number || `ORD-${orderId}`,
            date: data.created_at || "—",
            items: data.items || [],
            total: data.total || "—",
            storefront: data.storefront || "Kauvex",
            deliveryPin: data.delivery_pin || "—",
            status: data.status || "pending",
            estimatedDelivery: data.estimated_delivery || "—",
            carrier: data.carrier || "Kauvex Logistics Network",
            trackingNumber: data.tracking_number || "—",
            serviceLevel: data.service_level || "Standard",
            weight: data.weight || "—",
            dimensions: data.dimensions || "—",
            packagingType: data.packaging_type || "Standard Box",
            fulfillmentType: data.fulfillment_type || "Marketplace",
            lastUpdated: data.last_updated || "just now",
          };
          setDetail(mappedDetail);

          if (data.timeline && Array.isArray(data.timeline)) {
            const mappedTimeline: TrackingEvent[] = data.timeline.map((t: Record<string, string | boolean>) => ({
              status: (t.status as string) || "",
              label: (t.label as string) || (t.description as string) || "",
              date: (t.date as string) || (t.timestamp as string) || "—",
              completed: !!t.completed,
              active: !!t.active,
            }));
            setTimeline(mappedTimeline);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const getStatusDisplay = () => {
    switch (detail.status) {
      case "picked": return { icon: Package, text: "Being prepared", color: "text-blue-600" };
      case "packed": return { icon: Package, text: "Packed and ready", color: "text-[#FF6B00]" };
      case "picked_up": case "in_transit": return { icon: Truck, text: "On its way to you", color: "text-[#FF6B00]" };
      case "out_for_delivery": return { icon: Navigation, text: "Almost there", color: "text-green-600" };
      case "delivered": return { icon: CheckCircle2, text: "Delivered", color: "text-green-600" };
      case "failed": return { icon: XCircle, text: "Delivery attempted", color: "text-red-600" };
      default: return { icon: Package, text: "Processing", color: "text-gray-500" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#FF6B00] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/orders/${params.id}`} className="p-1 hover:bg-gray-200 rounded">
            <ChevronRight size={20} className="rotate-180" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#0A1628]">Track Order</h1>
            <p className="text-xs text-gray-500">{detail.orderNumber}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full ${statusDisplay.color} bg-opacity-10 flex items-center justify-center`}>
              <StatusIcon size={24} className={statusDisplay.color} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#0A1628]">{statusDisplay.text}</h2>
              <p className="text-sm text-gray-500">Expected {detail.estimatedDelivery}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Last updated: {detail.lastUpdated}</p>

          {detail.status === "out_for_delivery" && detail.deliveryPin && detail.deliveryPin !== "—" && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-medium text-orange-800 mb-1">Your Delivery PIN</p>
              <p className="text-2xl font-bold text-[#FF6B00] tracking-widest">{detail.deliveryPin}</p>
              <p className="text-[10px] text-orange-600 mt-1">Share this PIN with your delivery partner to confirm receipt. Do not share with anyone else.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-[#0A1628] mb-4">Shipment Timeline</h3>
          <div className="space-y-0">
            {timeline.map((step, i) => (
              <div key={step.status + i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    step.completed ? "bg-green-500" : step.active ? "bg-[#FF6B00] border-2 border-orange-200" : "bg-gray-200"
                  }`}>
                    {step.completed && <CheckCircle2 size={12} className="text-white" />}
                    {step.active && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className={`w-0.5 h-8 ${step.completed ? "bg-green-200" : "bg-gray-200"}`} />
                  )}
                </div>
                <div className={`pb-6 ${step.active ? "opacity-100" : step.completed ? "opacity-70" : "opacity-40"}`}>
                  <p className={`text-sm font-medium ${step.active ? "text-[#FF6B00]" : step.completed ? "text-green-700" : "text-gray-500"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {detail.status === "out_for_delivery" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
              <Navigation size={14} className="text-[#FF6B00]" /> Live Tracking
            </h3>
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Live map loading...</p>
                <p className="text-xs text-gray-400">Partner location updated in real-time</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-[#FF6B00]/20 rounded-full flex items-center justify-center">
                <Truck size={16} className="text-[#FF6B00]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0A1628]">Emeka • Verified Rider</p>
                <p className="text-xs text-gray-500">4.9 ⭐ • Motorcycle</p>
              </div>
              <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Phone size={12} /> Call
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-[#0A1628] mb-3">Shipment Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Carrier", detail.carrier],
              ["Tracking #", detail.trackingNumber],
              ["Service Level", detail.serviceLevel],
              ["Weight", detail.weight],
              ["Dimensions", detail.dimensions],
              ["Packaging", detail.packagingType],
              ["Fulfillment", detail.fulfillmentType],
              ["Storefront", detail.storefront],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] text-gray-500">{label}</p>
                <p className="font-medium text-[#0A1628]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-[#FF6B00] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600">
            Report a Problem
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            Add Delivery Instructions
          </button>
        </div>

        {!rated && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Rate Your Delivery</h3>
            <p className="text-xs text-gray-500 mb-3">How was your delivery experience?</p>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => { setRating(star); setRated(true); }} className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  star <= rating ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  <Star size={18} fill={star <= rating ? "white" : "none"} />
                </button>
              ))}
            </div>
            {rated && (
              <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                <p className="text-sm text-green-700">Thank you for your feedback!</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-[#0A1628] mb-3">Order Summary</h3>
          <p className="text-xs text-gray-500 mb-2">{detail.date} • {detail.storefront}</p>
          {detail.items.length > 0 ? detail.items.map((item) => (
            <p key={item} className="text-sm text-[#0A1628]">• {item}</p>
          )) : (
            <p className="text-sm text-gray-400">No item details available</p>
          )}
          <p className="text-sm font-bold text-[#0A1628] mt-2">Total: {detail.total}</p>
        </div>
      </div>
    </div>
  );
}
