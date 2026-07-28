"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Briefcase, ChevronLeft, CheckCircle, Clock, AlertCircle, XCircle,
  Calendar, User, FileText, MapPin, Navigation, Camera, PenLine,
  Upload, Download, Shield, Wrench, ImageIcon, Check,
} from "lucide-react";

const statusColors: Record<string, string> = {
  scheduled: "bg-amber-50 text-amber-600",
  professional_assigned: "bg-blue-50 text-blue-600",
  professional_en_route: "bg-purple-50 text-purple-600",
  checked_in: "bg-orange/10 text-orange",
  in_progress: "bg-orange/10 text-orange",
  completed: "bg-green-50 text-green-600",
  disputed: "bg-red-50 text-red-600",
  cancelled: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled", professional_assigned: "Assigned",
  professional_en_route: "En Route", checked_in: "Checked In",
  in_progress: "In Progress", completed: "Completed",
  disputed: "Disputed", cancelled: "Cancelled",
};

interface Booking {
  id: string; title: string; client: string; clientEmail?: string;
  date: string; location: string; status: string; amount: number;
  description?: string; serviceType?: string; address?: string;
  scheduledTimeWindow?: string;
}

export default function ProJobsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [beforePhoto, setBeforePhoto] = useState<string>("");
  const [afterPhoto, setAfterPhoto] = useState<string>("");
  const [jobNotes, setJobNotes] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoTypeRef = useRef<"before" | "after">("before");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ professional: "me" });
        if (statusFilter !== "all") params.set("status", statusFilter);
        const res = await fetch(`/api/v1/kps/bookings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        } else setBookings([]);
      } catch { setBookings([]); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, [statusFilter]);

  const captureGps = () => {
    setGpsLoading(true);
    setActionError("");
    if (!navigator.geolocation) {
      setActionError("GPS not available on this device.");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsLat(pos.coords.latitude); setGpsLng(pos.coords.longitude); setGpsCaptured(true); setGpsLoading(false); },
      () => { setActionError("Could not get GPS position. Check permissions."); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const triggerPhotoUpload = (type: "before" | "after") => {
    photoTypeRef.current = type;
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (photoTypeRef.current === "before") setBeforePhoto(dataUrl);
      else setAfterPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const startSignature = () => {
    setShowSignaturePad(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = 400; canvas.height = 200;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#0A1628"; ctx.lineWidth = 2; ctx.lineCap = "round";
      let drawing = false;
      canvas.onmousedown = () => { drawing = true; ctx!.beginPath(); };
      canvas.onmousemove = (e) => { if (!drawing) return; const r = canvas.getBoundingClientRect(); ctx!.lineTo(e.clientX - r.left, e.clientY - r.top); ctx!.stroke(); };
      canvas.onmouseup = () => { drawing = false; };
      canvas.ontouchstart = (e) => { e.preventDefault(); drawing = true; const r = canvas.getBoundingClientRect(); const t = e.touches[0]; ctx!.beginPath(); ctx!.moveTo(t.clientX - r.left, t.clientY - r.top); };
      canvas.ontouchmove = (e) => { e.preventDefault(); if (!drawing) return; const r = canvas.getBoundingClientRect(); const t = e.touches[0]; ctx!.lineTo(t.clientX - r.left, t.clientY - r.top); ctx!.stroke(); };
      canvas.ontouchend = () => { drawing = false; };
      setIsDrawing(true);
    }, 100);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignatureDataUrl(canvas.toDataURL("image/png"));
    setShowSignaturePad(false);
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const updateStatus = async (newStatus: string, extra?: any) => {
    if (!selectedBooking) return;
    setActionLoading(true); setActionError(""); setActionSuccess("");
    try {
      const res = await fetch(`/api/v1/kps/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extra }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to update"); }
      const d = await res.json();
      setActionSuccess(`Job marked as "${statusLabels[newStatus] || newStatus}"`);
      setSelectedBooking((prev) => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) { setActionError(err.message); }
    finally { setActionLoading(false); }
  };

  const completeJob = async () => {
    if (!selectedBooking) return;
    if (!beforePhoto || !afterPhoto) { setActionError("Please upload before and after photos."); return; }
    if (!signatureDataUrl) { setActionError("Please capture customer signature."); return; }
    setActionLoading(true); setActionError(""); setActionSuccess("");
    try {
      const formData = new FormData();
      formData.append("status", "completed");
      formData.append("checkin_gps", gpsLat && gpsLng ? JSON.stringify({ lat: gpsLat, lng: gpsLng }) : "");
      formData.append("before_photo", beforePhoto);
      formData.append("after_photo", afterPhoto);
      formData.append("customer_signature", signatureDataUrl);
      formData.append("job_notes", jobNotes);
      const res = await fetch(`/api/v1/kps/bookings/${selectedBooking.id}/complete`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to complete"); }
      setActionSuccess("Job completed successfully! Installation certificate generated.");
      setSelectedBooking((prev) => prev ? { ...prev, status: "completed" } : null);
    } catch (err: any) { setActionError(err.message); }
    finally { setActionLoading(false); }
  };

  const filters = ["all", "scheduled", "professional_assigned", "professional_en_route", "checked_in", "in_progress", "completed", "disputed", "cancelled"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/pro/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-orange" /> My Jobs
        </h1>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button key={f} onClick={() => { setStatusFilter(f); setSelectedBooking(null); setActionSuccess(""); setActionError(""); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === f ? "bg-orange text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}>
              {statusLabels[f] || f}
            </button>
          ))}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-1/3" /><div className="h-3 bg-gray-100 rounded w-1/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : selectedBooking ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button onClick={() => setSelectedBooking(null)}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to list
            </button>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-navy">{selectedBooking.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedBooking.serviceType && <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5 inline" /> {selectedBooking.serviceType}</span>}
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[selectedBooking.status] || "bg-gray-100 text-gray-600"}`}>
                {statusLabels[selectedBooking.status] || selectedBooking.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600"><User className="w-4 h-4 text-gray-400" /> {selectedBooking.client}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4 text-gray-400" /> {selectedBooking.date} {selectedBooking.scheduledTimeWindow && `(${selectedBooking.scheduledTimeWindow})`}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> {selectedBooking.address || selectedBooking.location}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><FileText className="w-4 h-4 text-gray-400" /> ${selectedBooking.amount}</div>
            </div>

            {actionSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4 shrink-0" /> {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" /> {actionError}
              </div>
            )}

            <div className="space-y-4 mt-4 border-t border-gray-100 pt-4">
              {/* GPS Check-in */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-navy mb-2 flex items-center gap-1"><Navigation className="w-4 h-4 text-orange" /> GPS Check-in</h3>
                {gpsCaptured ? (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" /> Location captured: {gpsLat?.toFixed(6)}, {gpsLng?.toFixed(6)}
                  </div>
                ) : (
                  <button onClick={captureGps} disabled={gpsLoading}
                    className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {gpsLoading ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Capturing...</> : <><Navigation className="w-3.5 h-3.5" /> Capture My Location</>}
                  </button>
                )}
              </div>

              {/* Photos */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-navy mb-2 flex items-center gap-1"><Camera className="w-4 h-4 text-orange" /> Job Photos</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Before</p>
                    {beforePhoto ? (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200">
                        <img src={beforePhoto} alt="Before" className="w-full h-28 object-cover" />
                        <button onClick={() => setBeforePhoto("")} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">X</button>
                      </div>
                    ) : (
                      <button onClick={() => triggerPhotoUpload("before")} className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange/50 hover:text-orange transition-colors">
                        <Camera className="w-5 h-5" /><span className="text-[10px]">Take Photo</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">After</p>
                    {afterPhoto ? (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200">
                        <img src={afterPhoto} alt="After" className="w-full h-28 object-cover" />
                        <button onClick={() => setAfterPhoto("")} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">X</button>
                      </div>
                    ) : (
                      <button onClick={() => triggerPhotoUpload("after")} className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange/50 hover:text-orange transition-colors">
                        <Camera className="w-5 h-5" /><span className="text-[10px]">Take Photo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Signature */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-navy mb-2 flex items-center gap-1"><PenLine className="w-4 h-4 text-orange" /> Customer Signature</h3>
                {signatureDataUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={signatureDataUrl} alt="Signature" className="h-16 border border-gray-200 rounded-lg" />
                    <button onClick={() => { setSignatureDataUrl(""); setShowSignaturePad(true); }} className="text-xs text-orange hover:underline">Re-capture</button>
                  </div>
                ) : showSignaturePad ? (
                  <div className="space-y-2">
                    <canvas ref={canvasRef} className="w-full border-2 border-dashed border-gray-300 rounded-lg bg-white touch-none" style={{ height: 200 }} />
                    <div className="flex items-center gap-2">
                      <button onClick={clearSignature} className="text-xs text-gray-500 hover:text-navy px-3 py-1.5 border border-gray-200 rounded-lg">Clear</button>
                      <button onClick={saveSignature} className="text-xs bg-orange text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-orange/90">Save Signature</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={startSignature} className="inline-flex items-center gap-2 text-xs bg-navy hover:bg-navy/90 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                    <PenLine className="w-3.5 h-3.5" /> Capture Signature
                  </button>
                )}
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-navy mb-2 flex items-center gap-1"><FileText className="w-4 h-4 text-orange" /> Job Notes</h3>
                <textarea value={jobNotes} onChange={(e) => setJobNotes(e.target.value)} rows={3} placeholder="Any notes about this job, issues encountered, or follow-up needed..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50 resize-none" />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                {selectedBooking.status === "professional_assigned" && (
                  <button onClick={() => updateStatus("professional_en_route")} disabled={actionLoading}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                    {actionLoading ? "Updating..." : <><Navigation className="w-3.5 h-3.5" /> I'm On My Way</>}
                  </button>
                )}
                {selectedBooking.status === "professional_en_route" && (
                  <button onClick={() => updateStatus("checked_in", { checkin_gps: gpsLat && gpsLng ? { lat: gpsLat, lng: gpsLng } : null })} disabled={actionLoading || !gpsLat}
                    className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                    {actionLoading ? "Checking in..." : <><CheckCircle className="w-3.5 h-3.5" /> Check In (GPS Required)</>}
                  </button>
                )}
                {selectedBooking.status === "checked_in" && (
                  <button onClick={() => updateStatus("in_progress")} disabled={actionLoading}
                    className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                    {actionLoading ? "Starting..." : <><Briefcase className="w-3.5 h-3.5" /> Start Work</>}
                  </button>
                )}
                {selectedBooking.status === "in_progress" && (
                  <button onClick={completeJob} disabled={actionLoading}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                    {actionLoading ? "Completing..." : <><CheckCircle className="w-3.5 h-3.5" /> Complete Job (Photos + Signature Required)</>}
                  </button>
                )}
                <button onClick={() => { setSelectedBooking(null); setActionSuccess(""); setActionError(""); setGpsCaptured(false); setBeforePhoto(""); setAfterPhoto(""); setSignatureDataUrl(""); setJobNotes(""); }}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-navy px-3 py-2 transition-colors">
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
              </div>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy mb-1">No jobs found</h3>
            <p className="text-sm text-gray-500">
              {statusFilter === "all" ? "You have no bookings yet." : `No ${statusLabels[statusFilter]?.toLowerCase() || ""} jobs.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} onClick={() => setSelectedBooking(booking)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-navy">{booking.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[booking.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {booking.client}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {booking.location}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-semibold text-navy">${booking.amount}</div>
                    <span className="text-[9px] text-gray-400">{booking.serviceType}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}