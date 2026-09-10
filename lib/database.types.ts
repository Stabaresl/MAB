/**
 * Tipos del esquema de Postgres.
 *
 * Escritos a mano para que el proyecto compile antes de tener una instancia de
 * Supabase levantada. En cuanto la haya, se regeneran con `npm run db:types`,
 * que los sobreescribe con la verdad del servidor. Si el esquema y este archivo
 * se separan, TypeScript lo detecta en el siguiente `npm run typecheck`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * De dónde sale el número de un contador. `manual` es el que escribe el
 * administrador; los demás los cuenta el servidor al leer la fila, así que la
 * cifra nunca se queda desfasada respecto al catálogo.
 */
export type StatSource = "manual" | "productos" | "categorias" | "clientes";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          image_path: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          image_path?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          image_path?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          specs: string | null;
          image_url: string | null;
          image_path: string | null;
          is_published: boolean;
          is_featured: boolean;
          featured_position: number;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          specs?: string | null;
          image_url?: string | null;
          image_path?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          featured_position?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          specs?: string | null;
          image_url?: string | null;
          image_path?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          featured_position?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          id: number;
          whatsapp_primary: string;
          whatsapp_secondary: string | null;
          email: string;
          address: string;
          city: string;
          nit: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          whatsapp_primary: string;
          whatsapp_secondary?: string | null;
          email: string;
          address: string;
          city: string;
          nit: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          whatsapp_primary?: string;
          whatsapp_secondary?: string | null;
          email?: string;
          address?: string;
          city?: string;
          nit?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          logo_path: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          logo_path?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          logo_path?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stats: {
        Row: {
          id: string;
          label: string;
          value: number;
          suffix: string | null;
          icon: string;
          source: StatSource;
          is_published: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          value?: number;
          suffix?: string | null;
          icon?: string;
          source?: StatSource;
          is_published?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          value?: number;
          suffix?: string | null;
          icon?: string;
          source?: StatSource;
          is_published?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          author: string;
          role: string | null;
          quote: string;
          image_url: string | null;
          image_path: string | null;
          rating: number | null;
          is_published: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author: string;
          role?: string | null;
          quote: string;
          image_url?: string | null;
          image_path?: string | null;
          rating?: number | null;
          is_published?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author?: string;
          role?: string | null;
          quote?: string;
          image_url?: string | null;
          image_path?: string | null;
          rating?: number | null;
          is_published?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      /**
       * Borra una categoría con sus artículos dentro, en una sola transacción,
       * y devuelve las rutas de las imágenes que quedaron sin dueño para que la
       * aplicación las retire de Storage.
       */
      eliminar_categoria: {
        Args: { p_id: string };
        Returns: string[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Stat = Database["public"]["Tables"]["stats"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

/** Producto con su categoría resuelta, como lo devuelven las consultas del sitio. */
export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "name" | "slug">;
};
