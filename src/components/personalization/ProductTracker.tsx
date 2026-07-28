"use client";

import { useRef, useEffect } from "react";

interface ProductTrackerProps {
  productId: string;
  children: React.ReactNode;
}

export default function ProductTracker({ productId, children }: ProductTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || tracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;

          const payload = {
            eventType: "product_view",
            productId,
            sessionId: sessionStorage.getItem("kv_pers_session_id") || crypto.randomUUID(),
            pageUrl: window.location.href,
            referrer: document.referrer || undefined,
          };

          if (navigator.sendBeacon) {
            navigator.sendBeacon("/api/v1/personalization/events", JSON.stringify(payload));
          } else {
            fetch("/api/v1/personalization/events", {
              method: "POST",
              body: JSON.stringify(payload),
              headers: { "Content-Type": "application/json" },
              keepalive: true,
            });
          }

          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [productId]);

  return <div ref={ref}>{children}</div>;
}
