"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";

interface DigitalDownload {
  id: string;
  product_id: string;
  order_id: string;
  file_url: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  created_at: string;
  product?: { name: string; slug: string };
  order?: { order_number: string };
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DigitalDownload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await insforge.auth.getUser();
        if (user) {
          const { data } = await insforge.database
            .from("digital_downloads")
            .select("*, product:product_id(id, name, slug)")
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false });
          setDownloads(data || []);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Download size={24} className="text-blue" />
        <div>
          <h1 className="font-bold text-2xl text-text-1">Digital Downloads</h1>
          <p className="text-sm text-text-4">Access your purchased digital products</p>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <FileText size={48} className="text-text-4/30 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-text-1 mb-2">No downloads yet</h3>
          <p className="text-sm text-text-3 mb-4">Digital products you purchase will appear here for download.</p>
          <Link href="/shop"><Button>Browse Digital Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((d) => {
            const expired = d.expires_at && new Date(d.expires_at) < new Date();
            const exhausted = d.download_count >= d.max_downloads;
            const canDownload = !expired && !exhausted;

            return (
              <div key={d.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-1">{d.product?.name || "Digital Product"}</p>
                    <div className="flex items-center gap-2 text-xs text-text-4 mt-0.5">
                      <span>Order: {d.order?.order_number || "N/A"}</span>
                      <span>•</span>
                      <span>Downloads: {d.download_count}/{d.max_downloads}</span>
                      {d.expires_at && (
                        <>
                          <span>•</span>
                          <span className={expired ? "text-red" : "text-text-4"}>
                            {expired ? "Expired" : `Expires ${new Date(d.expires_at).toLocaleDateString()}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exhausted && (
                    <span className="text-[10px] text-red bg-red-50 px-2 py-1 rounded">Max downloads reached</span>
                  )}
                  {expired && (
                    <span className="text-[10px] text-red bg-red-50 px-2 py-1 rounded">Expired</span>
                  )}
                  {canDownload ? (
                    <a href={d.file_url} download className="inline-flex items-center gap-1 px-3 py-2 bg-blue text-white text-sm rounded-lg hover:bg-blue-dark transition-colors">
                      <Download size={14} /> Download
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-400 text-sm rounded-lg cursor-not-allowed">
                      <Download size={14} /> Unavailable
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
