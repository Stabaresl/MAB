/**
 * Tipos del esquema de Postgres.
 *
 * Escritos a mano para que el proyecto compile antes de tener una instancia de
 * Supabase levantada. En cuanto la haya, se regeneran con `npm run db:types`,
 * que los sobreescribe con la verdad del servidor. Si el esquema y este archivo
 * se separan, TypeScript lo detecta en el siguiente `npm run typecheck`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

/** Producto con su categoría resuelta, como lo devuelven las consultas del sitio. */
export type ProductWithCategory = Product & {
  category: Pick<Category, "id" | "name" | "slug">;
};
