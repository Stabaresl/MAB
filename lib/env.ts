/**
 * Lectura de variables de entorno con fallo ruidoso.
 *
 * Una variable ausente se convierte en un error con nombre y explicación, no en
 * un `undefined` que revienta tres capas más abajo con un mensaje inútil.
 */

function required(name: string, value: string | undefined, hint: string): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. ${hint}\n` +
        "En local va en .env.local; en producción, en Vercel → Settings → Environment Variables.",
    );
  }
  return value;
}

/**
 * ¿Hay credenciales de Supabase en el entorno?
 *
 * Existe para que `next build` funcione antes de que el proyecto de Supabase
 * esté creado: las consultas devuelven vacío con un aviso claro en el registro
 * en vez de reventar la compilación. No sirve para tapar errores de consulta
 * — esos se registran igual — sino para distinguir "todavía no configurado"
 * de "configurado y fallando".
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function supabaseUrl(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Es la URL del proyecto de Supabase (Project Settings → API).",
  );
}

export function supabaseAnonKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Es la clave pública anon de Supabase (Project Settings → API).",
  );
}

/**
 * Clave de servicio: salta las políticas RLS por completo. Solo se usa en
 * scripts de mantenimiento que corren fuera del navegador. Nunca debe llevar el
 * prefijo NEXT_PUBLIC_ ni importarse desde un componente de cliente.
 */
export function supabaseServiceRoleKey(): string {
  return required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "Es la clave service_role de Supabase. Es secreta: da acceso total saltándose RLS.",
  );
}

/** URL pública del sitio, para enlaces absolutos en metadatos y WhatsApp. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
