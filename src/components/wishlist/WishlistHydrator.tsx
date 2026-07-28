"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

export default function WishlistHydrator() {
  const { wishlistHydrated, setWishlistItems } = useUIStore();

  useEffect(() => {
    if (wishlistHydrated) return;

    (async () => {
      try {
        const { supabase } = await import("@/lib/insforge");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setWishlistItems([]);
          return;
        }

        const res = await fetch("/api/v1/wishlist", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          setWishlistItems(json.data?.productIds ?? []);
        } else {
          setWishlistItems([]);
        }
      } catch {
        setWishlistItems([]);
      }
    })();
  }, [wishlistHydrated, setWishlistItems]);

  return null;
}