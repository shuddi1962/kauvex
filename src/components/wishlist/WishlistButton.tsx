"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { supabase } from "@/lib/insforge";
import { useNotificationStore } from "@/store/notification-store";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
  variant?: "classic" | "overlay" | "bold" | "compact";
}

export default function WishlistButton({
  productId,
  className = "",
  size = 14,
  variant = "classic",
}: WishlistButtonProps) {
  const { wishlistItems, toggleWishlist } = useUIStore();
  const { addNotification } = useNotificationStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isWishlisted = wishlistItems.includes(productId);

  const handleClick = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      addNotification({
        type: "info",
        title: "Sign in required",
        message: "Please sign in to save items to your wishlist.",
      });
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    await toggleWishlist(productId);
    setLoading(false);

    addNotification({
      type: "wishlist-added",
      title: isWishlisted ? "Removed from wishlist" : "Saved to wishlist",
      message: isWishlisted
        ? "Item removed from your wishlist."
        : "Item added to your wishlist.",
    });
  }, [productId, isWishlisted, toggleWishlist, addNotification, router]);

  const variantStyles: Record<string, string> = {
    classic:
      "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-colors",
    overlay:
      "w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors",
    bold:
      "w-10 h-10 rounded-xl flex items-center justify-center shadow-medium transition-colors",
    compact:
      "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-colors",
  };

  const colorStyles = isWishlisted
    ? "bg-red text-white"
    : variant === "overlay"
      ? "bg-white/20 text-white hover:bg-red"
      : "bg-white text-text-3 hover:bg-red hover:text-white";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${variantStyles[variant]} ${colorStyles} ${className}`}
    >
      <Heart
        size={size}
        fill={isWishlisted ? "currentColor" : "none"}
        className={loading ? "animate-pulse" : ""}
      />
    </button>
  );
}