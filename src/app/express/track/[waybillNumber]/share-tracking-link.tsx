"use client";

import { useState } from "react";
import { Share2, MessageCircle, Smartphone, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  waybill: string;
  shareUrl: string;
}

export default function ShareTrackingLink({ waybill, shareUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Track your Kauvex Express shipment ${waybill}: ${shareUrl}`)}`;

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-text-3" />
        <h3 className="font-syne font-600 text-sm text-text-1">Share Tracking Link</h3>
      </div>
      <p className="text-xs text-text-4 mb-4">Let the receiver follow the delivery in real-time.</p>
      <div className="flex flex-col gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-text-1 bg-green-50 hover:bg-green-100 rounded-lg px-4 py-2.5 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-green-600" />
          Share on WhatsApp
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm font-medium text-text-1 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2.5 transition-colors text-left"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-text-3" />
              Copy Tracking Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
