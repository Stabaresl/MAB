import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { publicClient } from "@/lib/supabase/public";
import { site } from "@/lib/site";
import type { Category, Client, Product, Review, SiteSettings } from "@/lib/database.types";

/**
 * Consultas del catálogo público.
 *
 * Todas usan el cliente sin cookies, así que se ejecutan siempre como visitante
 * anónimo. Eso permite que Next genere las páginas una vez y las revalide por
 * tiempo, y hace que las políticas RLS sean la única puerta: lo no publicado no
 * sale, sin depender de un filtro que alguien pueda olvidar.
 */

/**
 * Aviso unico cuando falta la configuracion, para no llenar el registro con la
 * misma linea una vez por consulta durante una compilacion.
 */
let warnedMissingConfig = false;

function notConfigured(query: string): boolean {
  if (isSupabaseConfigured()) return false;
  if (!warnedMissingConfig) {
    warnedMissingConfig = true;
    console.warn(
      "Supabase no esta configurado (falta SUPABASE_URL o SUPABASE_ANON_KEY). " +
        "El catalogo se sirve vacio. Define las variables en .env.local o en Vercel.",
    );
  }
  console.warn(`  ${query}: sin conexion, devuelvo vacio.`);
  return true;
}

export type CategoryWithCount = Category & { productCount: number };

export type ProductCard = Pick<
  Product,
  "id" | "name" | "slug" | "specs" | "image_url"
> & {
  category: Pick<Category, "name" | "slug">;
};

/** Categorías con cuántos artículos publicados tiene cada una. */
export async function getCategories(): Promise<CategoryWithCount[]> {
  if (notConfigured("getCategories")) return [];

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .eq("products.is_published", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const { products, ...category } = row as Category & {
      products: { count: number }[] | null;
    };
    return { ...category, productCount: products?.[0]?.count ?? 0 };
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (notConfigured("getCategoryBySlug")) return null;

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getCategoryBySlug:", error.message);
    return null;
  }
  return data;
}

export async function getProductsByCategory(categoryId: string): Promise<ProductCard[]> {
  if (notConfigured("getProductsByCategory")) return [];

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, specs, image_url, category:categories(name, slug)")
    .eq("category_id", categoryId)
    .eq("is_published", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getProductsByCategory:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ProductCard[];
}

export async function getProductBySlug(slug: string) {
  if (notConfigured("getProductBySlug")) return null;

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug:", error.message);
    return null;
  }
  return data as (Product & { category: Pick<Category, "id" | "name" | "slug"> }) | null;
}

/** Artículos de otras categorías para el bloque "también te puede servir". */
export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
): Promise<ProductCard[]> {
  if (notConfigured("getRelatedProducts")) return [];

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, specs, image_url, category:categories(name, slug)")
    .eq("category_id", categoryId)
    .eq("is_published", true)
    .neq("id", excludeId)
    .order("position", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getRelatedProducts:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ProductCard[];
}

export async function getAllProducts(): Promise<ProductCard[]> {
  if (notConfigured("getAllProducts")) return [];

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, specs, image_url, category:categories(name, slug)")
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("getAllProducts:", error.message);
    return [];
  }
  return (data ?? []) as unknown as ProductCard[];
}

/**
 * Clientes del carrusel de referencias.
 *
 * Antes eran una lista fija en `lib/site.ts` con seis logotipos codificados en
 * el componente. Ahora los administra la empresa, así que añadir una
 * constructora nueva ya no es un despliegue.
 */
export async function getClients(): Promise<Client[]> {
  if (notConfigured("getClients")) return [];

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("position", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getClients:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getReviews(): Promise<Review[]> {
  if (notConfigured("getReviews")) return [];

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getReviews:", error.message);
    return [];
  }
  // Lo no publicado ya lo filtra la política RLS; esto solo lo hace explícito
  // para quien lea el código sin abrir el SQL.
  return (data ?? []).filter((review) => review.is_published);
}

export type StatCard = {
  id: string;
  label: string;
  value: number;
  suffix: string | null;
  icon: string;
};

/**
 * Contadores de la portada, con el número ya resuelto.
 *
 * Los que no son manuales se cuentan aquí y no se guardan: si el número
 * viviera en la fila habría que acordarse de actualizarlo cada vez que se
 * publica un artículo, y el día que se olvidara la portada estaría mintiendo.
 */
export async function getStats(): Promise<StatCard[]> {
  if (notConfigured("getStats")) return [];

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getStats:", error.message);
    return [];
  }

  const rows = (data ?? []).filter((stat) => stat.is_published);
  if (rows.length === 0) return [];

  const calculados = rows.some((stat) => stat.source !== "manual")
    ? await contarFuentes()
    : null;

  return rows.map((stat) => ({
    id: stat.id,
    label: stat.label,
    value: stat.source === "manual" ? stat.value : (calculados?.[stat.source] ?? 0),
    suffix: stat.suffix,
    icon: stat.icon,
  }));
}

/** Los tres números que el sitio puede contar por sí mismo. */
async function contarFuentes(): Promise<Record<"productos" | "categorias" | "clientes", number>> {
  const supabase = publicClient();

  const [productos, categorias, clientes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
  ]);

  return {
    productos: productos.count ?? 0,
    categorias: categorias.count ?? 0,
    clientes: clientes.count ?? 0,
  };
}

/**
 * Ajustes de contacto. Si la consulta falla o la fila no existe todavía, se
 * devuelven los datos del portafolio en vez de una página sin teléfono: el
 * contacto es justo lo que no puede faltar en este sitio.
 */
export async function getSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    id: 1,
    whatsapp_primary: site.contact.whatsappPrimary,
    whatsapp_secondary: site.contact.whatsappSecondary,
    email: site.contact.email,
    address: site.contact.address,
    city: site.contact.city,
    nit: site.nit,
    updated_at: new Date(0).toISOString(),
  };

  if (notConfigured("getSettings")) return fallback;

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("getSettings:", error.message);
    return fallback;
  }
  return data ?? fallback;
}
