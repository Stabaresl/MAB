/**
 * Comprueba que las garantías del backend son reales y no supuestas.
 *
 * Cada prueba ataca la base de datos directamente con la clave anónima, que es
 * la que tiene cualquiera que abra el sitio. Si una escritura sin sesión pasa,
 * la prueba falla y hay un agujero.
 *
 * Uso:  node --env-file=.env.local scripts/verify-backend.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("Faltan variables de entorno. Ejecuta con --env-file=.env.local");
  process.exit(1);
}

const options = { auth: { autoRefreshToken: false, persistSession: false } };
const anon = createClient(url, anonKey, options);      // un visitante cualquiera
const service = createClient(url, serviceKey, options); // el seed / mantenimiento

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    const detail = await fn();
    passed += 1;
    console.log(`  OK    ${name}${detail ? ` — ${detail}` : ""}`);
  } catch (cause) {
    failed += 1;
    console.error(`  FALLA ${name} — ${cause.message}`);
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

console.log(`Verificando ${url}\n`);

// --- Lectura pública ---------------------------------------------------------
console.log("Lectura pública");

await check("el visitante lee las categorías", async () => {
  const { data, error } = await anon.from("categories").select("slug");
  expect(!error, error?.message ?? "");
  expect(data.length === 10, `esperaba 10 categorías, hay ${data.length}`);
  return `${data.length} categorías`;
});

await check("el visitante lee los productos publicados", async () => {
  const { data, error } = await anon.from("products").select("slug");
  expect(!error, error?.message ?? "");
  expect(data.length === 45, `esperaba 45 productos, hay ${data.length}`);
  return `${data.length} productos`;
});

await check("el visitante lee los ajustes de contacto", async () => {
  const { data, error } = await anon.from("site_settings").select("*").eq("id", 1).single();
  expect(!error, error?.message ?? "");
  expect(data.whatsapp_primary === "3102672577", "el WhatsApp principal no coincide");
  return data.whatsapp_primary;
});

// --- Escritura bloqueada -----------------------------------------------------
console.log("\nEscritura sin sesión (debe rechazarse en la base de datos)");

await check("no puede crear un producto", async () => {
  const { data: category } = await service.from("categories").select("id").limit(1).single();
  const { error } = await anon.from("products").insert({
    category_id: category.id,
    name: "Producto intruso",
    slug: "producto-intruso",
  });
  expect(error, "el INSERT pasó sin sesión");
  return error.code;
});

await check("no puede crear una categoría", async () => {
  const { error } = await anon
    .from("categories")
    .insert({ name: "Categoría intrusa", slug: "categoria-intrusa" });
  expect(error, "el INSERT pasó sin sesión");
  return error.code;
});

await check("no puede editar un producto", async () => {
  const { data: product } = await service.from("products").select("id").limit(1).single();
  const { error, count } = await anon
    .from("products")
    .update({ name: "Nombre cambiado" }, { count: "exact" })
    .eq("id", product.id);
  // RLS puede rechazar o simplemente no encontrar ninguna fila que el rol pueda
  // tocar. Las dos son correctas; lo que no vale es que cambie algo.
  expect(error || count === 0, "el UPDATE modificó filas sin sesión");
  return error ? error.code : "0 filas afectadas";
});

await check("no puede borrar un producto", async () => {
  const { data: product } = await service.from("products").select("id").limit(1).single();
  const { error, count } = await anon
    .from("products")
    .delete({ count: "exact" })
    .eq("id", product.id);
  expect(error || count === 0, "el DELETE borró filas sin sesión");

  const { count: sigue } = await service
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("id", product.id);
  expect(sigue === 1, "el producto desapareció");
  return error ? error.code : "0 filas afectadas";
});

await check("no puede cambiar los datos de contacto", async () => {
  const { error, count } = await anon
    .from("site_settings")
    .update({ whatsapp_primary: "0000000000" }, { count: "exact" })
    .eq("id", 1);
  expect(error || count === 0, "el UPDATE cambió los ajustes sin sesión");

  const { data } = await anon.from("site_settings").select("whatsapp_primary").eq("id", 1).single();
  expect(data.whatsapp_primary === "3102672577", "el teléfono quedó alterado");
  return error ? error.code : "0 filas afectadas";
});

// --- Productos sin publicar --------------------------------------------------
console.log("\nProductos sin publicar");

await check("un borrador no sale por la API pública", async () => {
  const { data: victim } = await service
    .from("products")
    .select("id, slug")
    .eq("slug", "pozuelo")
    .single();

  await service.from("products").update({ is_published: false }).eq("id", victim.id);

  const { data: visto } = await anon.from("products").select("slug").eq("slug", victim.slug);
  const { data: total } = await anon.from("products").select("slug");

  await service.from("products").update({ is_published: true }).eq("id", victim.id);

  expect(visto.length === 0, "el borrador seguía siendo visible");
  expect(total.length === 44, `esperaba 44 visibles, había ${total.length}`);
  return "oculto para el visitante, visible para el panel";
});

// --- Integridad referencial --------------------------------------------------
console.log("\nIntegridad");

await check("no se puede borrar una categoría con artículos", async () => {
  const { data: category } = await service
    .from("categories")
    .select("id, name")
    .eq("slug", "rejillas")
    .single();

  const { error } = await service.from("categories").delete().eq("id", category.id);
  expect(error, "la categoría se borró llevándose sus artículos");
  expect(error.code === "23503", `esperaba 23503, llegó ${error.code}`);

  const { count } = await service
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", category.id);
  expect(count === 13, `los artículos cambiaron: ${count}`);
  return `${error.code} y los 13 artículos intactos`;
});

await check("el slug duplicado se rechaza", async () => {
  const { data: category } = await service.from("categories").select("id").limit(1).single();
  const { error } = await service
    .from("products")
    .insert({ category_id: category.id, name: "Pozuelo", slug: "pozuelo" });
  expect(error, "se aceptó un slug repetido");
  expect(error.code === "23505", `esperaba 23505, llegó ${error.code}`);
  return error.code;
});

await check("un slug con mayúsculas o espacios se rechaza", async () => {
  const { data: category } = await service.from("categories").select("id").limit(1).single();
  const { error } = await service
    .from("products")
    .insert({ category_id: category.id, name: "Prueba", slug: "Slug Invalido" });
  expect(error, "se aceptó un slug con formato inválido");
  expect(error.code === "23514", `esperaba 23514, llegó ${error.code}`);
  return error.code;
});

await check("no puede existir una segunda fila de ajustes", async () => {
  const { error } = await service.from("site_settings").insert({
    id: 2,
    whatsapp_primary: "3000000000",
    email: "otro@ejemplo.com",
    address: "x",
    city: "y",
    nit: "z",
  });
  expect(error, "se creó una segunda fila de ajustes");
  return error.code;
});

// --- Storage -----------------------------------------------------------------
console.log("\nStorage");

await check("el bucket limita tamaño y tipos", async () => {
  const { data, error } = await service.storage.getBucket("catalogo");
  expect(!error, error?.message ?? "");
  expect(data.public === true, "el bucket no es público");
  expect(data.file_size_limit === 5242880, `límite ${data.file_size_limit}`);
  expect(
    data.allowed_mime_types.join(",") === "image/jpeg,image/png,image/webp",
    `tipos ${data.allowed_mime_types}`,
  );
  return "público, 5 MB, solo jpeg/png/webp";
});

await check("el visitante no puede subir archivos", async () => {
  const { error } = await anon.storage
    .from("catalogo")
    .upload(`intruso-${Date.now()}.webp`, new Blob([new Uint8Array([0x52, 0x49, 0x46, 0x46])]), {
      contentType: "image/webp",
    });
  expect(error, "la subida anónima pasó");
  return "rechazado";
});

// --- Resultado ---------------------------------------------------------------
console.log(`\n${passed} correctas, ${failed} fallidas`);
process.exit(failed > 0 ? 1 : 0);
