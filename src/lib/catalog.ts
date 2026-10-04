import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Variant = Database["public"]["Tables"]["product_variants"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Settings = Database["public"]["Tables"]["store_settings"]["Row"];
export type ShippingRate = Database["public"]["Tables"]["shipping_rates"]["Row"];

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["store-settings"],
  queryFn: async (): Promise<Settings | null> => {
    const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
    return data;
  },
});

export const shippingQuery = queryOptions({
  queryKey: ["shipping-rates"],
  queryFn: async (): Promise<ShippingRate[]> => {
    const { data, error } = await supabase.from("shipping_rates").select("*").order("fee");
    if (error) throw error;
    return data ?? [];
  },
});

export function productQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(*), reviews(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as (Product & { product_variants: Variant[]; reviews: Review[] }) | null;
    },
  });
}

export function priceOf(p: Pick<Product, "price" | "sale_price">) {
  return Number(p.sale_price ?? p.price);
}

export function discountPercent(p: Pick<Product, "price" | "sale_price">) {
  if (!p.sale_price) return 0;
  return Math.round((1 - Number(p.sale_price) / Number(p.price)) * 100);
}

export const COLLECTIONS = [
  { id: "casual", name: "كاجوال", image: "/images/collection-street.jpg" },
  { id: "smart-casual", name: "سمارت كاجوال", image: "/images/collection-formal.jpg" },
  { id: "formal", name: "رسمي", image: "/images/collection-formal.jpg" },
  { id: "streetwear", name: "ستريت وير", image: "/images/collection-street.jpg" },
];
