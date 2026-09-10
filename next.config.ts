import type { NextConfig } from "next";

/**
 * Hosts desde los que `next/image` puede servir una foto.
 *
 * Se deriva de la URL del proyecto para no mantener el dominio en dos sitios,
 * pero con un comodín de reserva, y esa reserva no es un adorno: **este archivo
 * se evalúa antes de que Next cargue `.env.local`**. En Vercel no se nota
 * —las variables ya están en el entorno del proceso cuando arranca la
 * compilación—, pero en desarrollo `process.env.SUPABASE_URL` llega vacío, la
 * lista de patrones se quedaba vacía con ella, y toda foto subida por el
 * administrador reventaba con un «hostname is not configured». Las del
 * repositorio se veían bien, así que el fallo solo aparecía con contenido real.
 *
 * El comodín no abre nada preocupante: acota el protocolo, el subdominio a
 * `*.supabase.co` y la ruta a los objetos públicos de Storage, que son
 * exactamente los que este sitio publica.
 */
function supabaseImageHost(): NextConfig["images"] {
  const RUTA = "/storage/v1/object/public/**";
  const comodin = { protocol: "https", hostname: "*.supabase.co", pathname: RUTA } as const;

  const url = process.env.SUPABASE_URL;
  if (!url) return { remotePatterns: [comodin] };

  try {
    const { hostname } = new URL(url);
    return {
      remotePatterns: [{ protocol: "https", hostname, pathname: RUTA }, comodin],
    };
  } catch {
    console.warn("SUPABASE_URL no es una URL válida; se sirve solo desde *.supabase.co.");
    return { remotePatterns: [comodin] };
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    ...supabaseImageHost(),
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    dirs: ["app", "components", "lib", "scripts"],
  },
  /**
   * Carpetas que cambian solas y no forman parte del código: material de
   * referencia, salidas de herramientas y las fuentes en bruto del portafolio.
   * Sin esto, cualquier escritura ahí dispara una recompilación en desarrollo
   * y puede cortar una petición en curso.
   */
  webpack(config) {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/.next/**",
        "**/assets/**",
        "**/design-rules/**",
        "**/.agents/**",
        "**/.playwright-mcp/**",
        "**/supabase/.temp/**",
      ],
    };
    return config;
  },
};

export default nextConfig;
