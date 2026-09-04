import type { NextConfig } from "next";

/**
 * El host de Supabase Storage se deriva de la URL del proyecto para no tener que
 * mantener el dominio en dos sitios. Si la variable falta, `remotePatterns` queda
 * vacío y `next/image` solo sirve las imágenes locales de `public/` — el sitio
 * arranca igual y el fallo se ve en el panel, no en una pantalla en blanco.
 */
function supabaseImageHost(): NextConfig["images"] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return {};
  try {
    const { hostname } = new URL(url);
    return {
      remotePatterns: [
        { protocol: "https", hostname, pathname: "/storage/v1/object/public/**" },
      ],
    };
  } catch {
    console.warn("NEXT_PUBLIC_SUPABASE_URL no es una URL válida; next/image servirá solo imágenes locales.");
    return {};
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
