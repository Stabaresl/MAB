/**
 * Carga el catálogo inicial en Supabase a partir de data/manifest.json.
 *
 * Es idempotente: se puede correr las veces que haga falta sin duplicar nada,
 * porque todo entra por `upsert` contra la columna `slug`. Las imágenes no se
 * suben a Storage — ya viven en `public/catalogo/`, versionadas con el
 * proyecto — así que el catálogo inicial funciona aunque Storage esté vacío.
 * Las que suba después el administrador desde el panel sí van a Storage.
 *
 * Uso:
 *   node --env-file=.env.local scripts/seed.mjs
 *   node --env-file=.env.local scripts/seed.mjs --admin correo@ejemplo.com --clave "…"
 */
import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Ejecuta con: node --env-file=.env.local scripts/seed.mjs",
  );
  process.exit(1);
}

// El seed usa la clave de servicio a propósito: escribe saltándose RLS, que es
// justo lo que no puede hacer la aplicación. Este script nunca llega al
// navegador ni se despliega.
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const manifest = JSON.parse(readFileSync("data/manifest.json", "utf8"));

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

/** Ruta pública de la imagen ya procesada en public/catalogo/. */
function imageUrl(categorySlug, productSlug) {
  return `/catalogo/${categorySlug}/${productSlug}.webp`;
}

async function seedSettings() {
  const { error } = await supabase.from("site_settings").upsert(
    {
      id: 1,
      whatsapp_primary: "3102672577",
      whatsapp_secondary: "3205668666",
      email: "miguelbui04@gmail.com",
      address: "La Sultana, Calle 68A #8-80",
      city: "Manizales",
      nit: "1.055.830.162-7",
    },
    { onConflict: "id" },
  );

  if (error) throw new Error(`site_settings: ${error.message}`);
  console.log("· ajustes del sitio");
}

async function seedCatalog() {
  let categoryCount = 0;
  let productCount = 0;

  for (const [position, category] of manifest.categories.entries()) {
    const { data: saved, error } = await supabase
      .from("categories")
      .upsert(
        {
          name: category.name,
          slug: category.slug,
          description: category.description,
          image_url: imageUrl(category.slug, category.cover),
          position,
        },
        { onConflict: "slug" },
      )
      .select("id, name")
      .single();

    if (error) throw new Error(`categoría ${category.slug}: ${error.message}`);
    categoryCount += 1;

    const rows = category.products.map((product, index) => ({
      category_id: saved.id,
      name: product.name,
      slug: product.slug,
      specs: product.specs ?? null,
      description: null,
      image_url: imageUrl(category.slug, product.slug),
      is_published: true,
      position: index,
    }));

    const { error: productError } = await supabase
      .from("products")
      .upsert(rows, { onConflict: "slug" });

    if (productError) throw new Error(`productos de ${category.slug}: ${productError.message}`);
    productCount += rows.length;

    console.log(`· ${saved.name} — ${rows.length} artículos`);
  }

  return { categoryCount, productCount };
}

/** Crea el administrador si se pasan --admin y --clave. */
async function seedAdmin() {
  const email = arg("admin");
  const password = arg("clave");

  if (!email || !password) {
    console.log("· administrador: omitido (pasa --admin y --clave para crearlo)");
    return;
  }

  if (password.length < 8) {
    throw new Error("La contraseña del administrador necesita al menos 8 caracteres.");
  }

  const { data: existing } = await supabase.auth.admin.listUsers();
  const already = existing?.users.find((user) => user.email === email);

  if (already) {
    const { error } = await supabase.auth.admin.updateUserById(already.id, { password });
    if (error) throw new Error(`administrador: ${error.message}`);
    console.log(`· administrador ${email} — contraseña actualizada`);
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(`administrador: ${error.message}`);
  console.log(`· administrador ${email} — creado`);
}

try {
  console.log(`Sembrando ${url}\n`);
  await seedSettings();
  const { categoryCount, productCount } = await seedCatalog();
  await seedAdmin();
  console.log(`\nListo: ${categoryCount} categorías, ${productCount} artículos.`);
} catch (cause) {
  console.error(`\nEl seed falló: ${cause.message}`);
  process.exit(1);
}
