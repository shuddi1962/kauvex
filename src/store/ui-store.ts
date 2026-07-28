import { create } from "zustand";

interface UIStore {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  compareItems: string[];
  wishlistItems: string[];
  wishlistHydrated: boolean;
  recentlyViewed: string[];
  noticeBarDismissed: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleCompare: (productId: string) => void;
  toggleWishlist: (productId: string) => Promise<void>;
  setWishlistItems: (ids: string[]) => void;
  addRecentlyViewed: (productId: string) => void;
  dismissNoticeBar: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  mobileMenuOpen: false,
  searchOpen: false,
  compareItems: [],
  wishlistItems: [],
  wishlistHydrated: false,
  recentlyViewed: [],
  noticeBarDismissed: false,

  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),

  toggleCompare: (productId) => {
    set((state) => {
      const exists = state.compareItems.includes(productId);
      return {
        compareItems: exists
          ? state.compareItems.filter((id) => id !== productId)
          : [...state.compareItems.slice(-3), productId],
      };
    });
  },

  setWishlistItems: (ids) => set({ wishlistItems: ids, wishlistHydrated: true }),

  toggleWishlist: async (productId) => {
    const exists = get().wishlistItems.includes(productId);

    set((state) => ({
      wishlistItems: exists
        ? state.wishlistItems.filter((id) => id !== productId)
        : [...state.wishlistItems, productId],
    }));

    try {
      const { supabase } = await import("@/lib/insforge");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const res = await fetch(
          exists ? `/api/v1/wishlist?productId=${productId}` : "/api/v1/wishlist",
          {
            method: exists ? "DELETE" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: exists ? undefined : JSON.stringify({ productId }),
          }
        );
        if (!res.ok) {
          set((state) => ({
            wishlistItems: exists
              ? [...state.wishlistItems, productId]
              : state.wishlistItems.filter((id) => id !== productId),
          }));
        }
      }
    } catch {
      // Silently fail — local state remains as-is for optimistic UX
    }
  },

  addRecentlyViewed: (productId) => {
    set((state) => {
      const filtered = state.recentlyViewed.filter((id) => id !== productId);
      return { recentlyViewed: [productId, ...filtered].slice(0, 20) };
    });
  },

  dismissNoticeBar: () => set({ noticeBarDismissed: true }),
}));