"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ProductStorefrontAssignment {
  storefrontId: string;
  storefrontName: string;
  storefrontSlug: string;
  isAssigned: boolean;
  isActive: boolean;
  sortOrder: number;
}

export async function getProductStorefronts(
  productId: string
): Promise<ProductStorefrontAssignment[]> {
  try {
    const db = createAdminClient();

    const { data: storefronts } = await db
      .from("storefronts")
      .select("id, name, slug")
      .eq("status", "active")
      .order("name");

    const { data: assignments } = await db
      .from("product_storefronts")
      .select("storefront_id, is_active, sort_order")
      .eq("product_id", productId);

    const assignmentMap = new Map(
      (assignments || []).map((a: any) => [
        a.storefront_id,
        { isActive: a.is_active, sortOrder: a.sort_order || 0 },
      ])
    );

    return (storefronts || []).map((sf: any) => ({
      storefrontId: sf.id,
      storefrontName: sf.name,
      storefrontSlug: sf.slug,
      isAssigned: assignmentMap.has(sf.id),
      isActive: assignmentMap.get(sf.id)?.isActive ?? false,
      sortOrder: assignmentMap.get(sf.id)?.sortOrder ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function assignProductToStorefronts(params: {
  productId: string;
  storefrontIds: string[];
}) {
  try {
    const db = createAdminClient();

    await db.from("product_storefronts").delete().eq("product_id", params.productId);

    if (params.storefrontIds.length > 0) {
      const inserts = params.storefrontIds.map((sfId, i) => ({
        product_id: params.productId,
        storefront_id: sfId,
        is_active: true,
        sort_order: i,
      }));
      await db.from("product_storefronts").insert(inserts);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function getStorefrontsForVendorProduct(
  productId: string,
  vendorId: string
): Promise<ProductStorefrontAssignment[]> {
  try {
    const db = createAdminClient();

    const { data: storefronts } = await db
      .from("storefronts")
      .select("id, name, slug")
      .eq("status", "active")
      .order("name");

    const { data: vendorSfs } = await db
      .from("vendor_storefronts")
      .select("storefront_id")
      .eq("vendor_id", vendorId);

    const allowedStorefrontIds = new Set(
      (vendorSfs || []).map((v: any) => v.storefront_id)
    );

    const { data: assignments } = await db
      .from("product_storefronts")
      .select("storefront_id, is_active, sort_order")
      .eq("product_id", productId);

    const assignmentMap = new Map(
      (assignments || []).map((a: any) => [
        a.storefront_id,
        { isActive: a.is_active, sortOrder: a.sort_order || 0 },
      ])
    );

    return (storefronts || [])
      .filter((sf: any) => allowedStorefrontIds.has(sf.id))
      .map((sf: any) => ({
        storefrontId: sf.id,
        storefrontName: sf.name,
        storefrontSlug: sf.slug,
        isAssigned: assignmentMap.has(sf.id),
        isActive: assignmentMap.get(sf.id)?.isActive ?? false,
        sortOrder: assignmentMap.get(sf.id)?.sortOrder ?? 0,
      }));
  } catch {
    return [];
  }
}
