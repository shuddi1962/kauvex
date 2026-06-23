import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2, Truck, MapPin, Clock, Package, CheckCircle2, CircleDot, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareTrackingLink from "./share-tracking-link";

interface Props {
  params: { waybillNumber: string };
}

const waybillPattern = /^KEX-\d{4}-\d{7}$/;

const demoData = {
  waybill: "KEX-2026-0084729",
  status: "in-transit",
  service: "Express",
  estimatedDelivery: "Jun 25, 2026",
  pickupDate: "Jun 23, 2026",
  pickupAddress: "25 Broad Street, Lagos Island, Lagos State",
  dropoffAddress: "42 Aminu Kano Crescent, Wuse 2, Abuja FCT",
  weight: "5 kg",
  contents: "Electronics",
  timeline: [
    { status: "Order Placed", date: "Jun 23, 2026 — 8:15 AM", location: "Online", desc: "Shipment created via Kauvex Express", completed: true },
    { status: "Picked Up", date: "Jun 23, 2026 — 10:30 AM", location: "Lagos Island", desc: "Package picked up from sender", completed: true },
    { status: "In Transit", date: "Jun 23, 2026 — 1:45 PM", location: "Lagos Hub", desc: "Package arrived at sorting facility", completed: true, current: true },
    { status: "Out for Delivery", date: "Estimated Jun 25", location: "Abuja FCT", desc: "Package will be delivered to receiver", completed: false },
    { status: "Delivered", date: "Pending", location: "—", desc: "Awaiting delivery confirmation", completed: false },
  ],
};

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `Track ${params.waybillNumber} — Kauvex Express`,
    description: `Real-time tracking for Kauvex Express waybill ${params.waybillNumber}. View shipment status, timeline, and estimated delivery.`,
  };
}

export default function TrackResultPage({ params }: Props) {
  if (!waybillPattern.test(params.waybillNumber)) {
    notFound();
  }

  const data = demoData;
  const shareUrl = `https://kauvex.com/express/track/${params.waybillNumber}`;

  return (
    <div className="bg-off-white min-h-screen">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-3">
          <Link href="/" className="hover:text-blue">Home</Link>
          <span>/</span>
          <Link href="/express" className="hover:text-blue">Express</Link>
          <span>/</span>
          <Link href="/express/track" className="hover:text-blue">Track</Link>
          <span>/</span>
          <span className="font-mono text-text-1 font-medium">{params.waybillNumber}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/express/track" className="inline-flex items-center gap-1.5 text-sm text-text-3 hover:text-orange mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tracking
        </Link>

        <div className="bg-gradient-to-r from-navy to-navy/90 rounded-2xl p-6 lg:p-8 text-white mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/50 mb-1">Waybill Number</p>
              <h1 className="text-2xl lg:text-3xl font-syne font-800 tracking-wider">{data.waybill}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-xs bg-orange/20 text-orange px-2.5 py-0.5 rounded-full font-semibold">
                  <Truck className="w-3 h-3" /> In Transit
                </span>
                <span className="text-xs text-white/60">Service: {data.service}</span>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-xs text-white/50">Estimated Delivery</p>
              <p className="text-xl font-syne font-700 text-orange">{data.estimatedDelivery}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-syne font-700 text-lg text-text-1 mb-6">Tracking Timeline</h2>
              <div className="space-y-0">
                {data.timeline.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {step.current ? (
                        <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center">
                          <CircleDot className="w-4 h-4 text-white" />
                        </div>
                      ) : step.completed ? (
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center">
                          <Clock className="w-3 h-3 text-text-4" />
                        </div>
                      )}
                      {i < data.timeline.length - 1 && (
                        <div className={`w-0.5 h-14 ${step.completed ? "bg-success" : "bg-border"}`} />
                      )}
                    </div>
                    <div className={`pb-8 ${i === data.timeline.length - 1 ? "pb-0" : ""}`}>
                      <p className={`font-syne font-600 text-sm ${step.current ? "text-orange" : step.completed ? "text-text-1" : "text-text-4"}`}>
                        {step.status}
                      </p>
                      <p className="text-xs text-text-3 mt-0.5">{step.date}</p>
                      <p className="text-xs text-text-4 mt-0.5">{step.location}</p>
                      <p className="text-xs text-text-4 mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-syne font-600 text-sm text-text-1 mb-3">Shipment Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-text-4">Service</p>
                  <p className="font-medium text-text-1">{data.service}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4">Weight</p>
                  <p className="font-medium text-text-1">{data.weight}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4">Contents</p>
                  <p className="font-medium text-text-1">{data.contents}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4">Pickup Date</p>
                  <p className="font-medium text-text-1">{data.pickupDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-syne font-600 text-sm text-text-1 mb-3">Locations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-text-4">Pickup</p>
                    <p className="text-xs font-medium text-text-1">{data.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-text-4">Dropoff</p>
                    <p className="text-xs font-medium text-text-1">{data.dropoffAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <ShareTrackingLink waybill={params.waybillNumber} shareUrl={shareUrl} />

            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-orange mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-1">Need help?</p>
                  <p className="text-xs text-text-3 mt-1">Contact our support team Mon–Sat, 8AM–6PM WAT</p>
                  <Link href="/contact">
                    <Button variant="navy" size="sm" className="mt-3 text-xs">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
