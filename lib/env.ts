/**
 * Lectura de variables de entorno con fallo ruidoso.
 *
 * Una variable ausente se convierte en un error con nombre y explicación, no en
 * un `undefined` que revienta tres capas más abajo con un mensaje inútil.
 *
 * NINGUNA lleva el prefijo `NEXT_PUBLIC_`, y eso es deliberado aunque en un
 * proyecto de Next con Supabase lo habitual sea lo contrario.
 *
 * El prefijo existe para que Next incruste el valor en el paquete que se
 * descarga el navegador. Aquí no hace falta: el sitio no habla con Supabase
 * desde el navegador en ningún punto. El catálogo lo leen componentes de
 * servidor, la sesión la refresca el middleware, y el acceso al panel y todas
 * las escrituras pasan por Server Actions. Con el prefijo, la URL y la clave
 * viajaban a cada visitante sin que nadie las usara allí.
 *
 * Consecuencia práctica, para quien venga después: si algún día se necesita un
 * cliente de Supabase en el navegador, estas funciones NO valen —`process.env`
 * sin prefijo no existe en el cliente—. Habrá que pasar los valores desde el
 * servidor como props, o volver a poner el prefijo a conciencia.
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
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export function supabaseUrl(): string {
  return required(
    "SUPABASE_URL",
    process.env.SUPABASE_URL,
    "Es la URL del proyecto de Supabase (Project Settings → API).",
  );
}

export function supabaseAnonKey(): string {
  return required(
    "SUPABASE_ANON_KEY",
    process.env.SUPABASE_ANON_KEY,
    "Es la clave anon de Supabase (Project Settings → API).",
  );
}

/**
 * Clave de servicio: salta las políticas RLS por completo. Solo se usa en
 * scripts de mantenimiento que corren fuera del navegador. Nunca debe estar
 * puesta en el servidor de producción ni importarse desde la aplicación.
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
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
