"use client";

import dynamic from "next/dynamic";

const AnalyticsContent = dynamic(() => import("./analytics-content"), { ssr: false });

export default function VendorAdAnalyticsPage() {
  return <AnalyticsContent />;
}
