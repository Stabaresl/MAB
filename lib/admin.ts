import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/database.types";

/**
 * Consultas del panel.
 *
 * A diferencia de las del sitio público, estas no filtran `is_published`: el
 * administrador tiene que ver también lo que todavía no ha publicado, que es
 * justo lo que necesita revisar.
 */

export type AdminProduct = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export async function listProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listProducts:", error.message);
    return [];
  }
  return (data ?? []) as unknown as AdminProduct[];
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getProduct:", error.message);
    return null;
  }
  return data as unknown as AdminProduct | null;
}

export type AdminCategory = Category & { productCount: number };

export async function listCategories(): Promise<AdminCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("listCategories:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const { products, ...category } = row as Category & { products: { count: number }[] | null };
    return { ...category, productCount: products?.[0]?.count ?? 0 };
  });
}

export async function getCategory(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("getCategory:", error.message);
    return null;
  }
  return data;
}

export type DashboardCounts = {
  products: number;
  published: number;
  drafts: number;
  categories: number;
  emptyCategories: number;
};

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const supabase = await createClient();

  const [products, published, categories] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("categories").select("*, products(count)"),
  ]);

  const categoryRows = (categories.data ?? []) as (Category & {
    products: { count: number }[] | null;
  })[];

  const total = products.count ?? 0;
  const live = published.count ?? 0;

  return {
    products: total,
    published: live,
    drafts: total - live,
    categories: categoryRows.length,
    emptyCategories: categoryRows.filter((row) => (row.products?.[0]?.count ?? 0) === 0).length,
  };
}
