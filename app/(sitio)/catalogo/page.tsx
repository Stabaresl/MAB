import type { Metadata } from "next";
import Link from "next/link";

import { CatalogBanner } from "@/components/catalog-banner";
import { CatalogBrowser } from "@/components/catalog-browser";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product-card";
import {
  getAllProducts,
  getCategories,
  getFeaturedProducts,
  getSettings,
} from "@/lib/catalog";
import { site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Materiales de construcción y ferretería por categoría: zona húmeda, lavaplatos, duchas y monomando, rejillas, eléctricos, cajas de gas, baños, seguridad y cocina.",
};

export default async function CatalogoPage() {
  const [categories, productos, destacados, settings] = await Promise.all([
    getCategories(),
    getAllProducts(),
    getFeaturedProducts(),
    getSettings(),
  ]);

  return (
    <>
      {/*
        Banner de la empresa.

        Estuvo a sangre, del ancho de la pantalla, y salía mal por dos motivos:
        ocupaba media portada del catálogo, y en un monitor ancho la imagen —de
        1376px— se estiraba a 1920 y se veía blanda. Dentro del contenedor nunca
        se amplía por encima de su tamaño real, así que se ve nítida, y deja de
        comerse la pantalla.

        Es decorativo en el sentido estricto —el titular va debajo, en texto de
        verdad— pero cada pieza lleva `alt` porque el rótulo que traen dentro
        dice cosas que no están escritas en ninguna otra parte de la página.
      */}
      <section className="lavado lavado-sale">
        <div className="page pt-8 md:pt-10">
          <CatalogBanner />
        </div>

        <div className="page py-12 md:py-16">
          <Reveal>
            <p className="label text-accent-ink">Catálogo</p>
            <h1 className="mt-3 max-w-[14ch] text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.06] text-ink">
              Todo para tu proyecto
            </h1>
            <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-ink-2">
              {productos.length} artículos publicados en {categories.length} categorías.
              Trabajamos con más referencias de las que aparecen aquí: si no ves lo que buscas,
              escríbenos y te decimos si la tenemos.
            </p>
          </Reveal>
        </div>
      </section>

      {/*
        Los más vendidos, antes de entrar en ninguna categoría.

        Es lo primero que se ve del catálogo porque es lo que responde a la
        pregunta con la que entra casi todo el mundo: «¿qué venden?». Un rail de
        diez categorías es una respuesta correcta y completamente inútil para
        quien todavía no sabe cómo se llama lo que busca.

        Los elige MAB en el panel. No se calculan: el sitio no registra ventas
        —el negocio se cierra por WhatsApp— así que cualquier ranking que sacara
        de sus propios datos sería inventado.
      */}
      {destacados.length > 0 && (
        <section id="mas-vendidos" className="lavado lavado-calido scroll-mt-24">
          <div className="page py-14 md:py-20">
            <Reveal>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="label text-sun-ink">Lo más pedido</p>
                  <h2 className="mt-3 max-w-[16ch] text-[clamp(1.7rem,4.2vw,2.6rem)] leading-[1.1] text-ink">
                    Los más <span className="remate">vendidos</span>
                  </h2>
                </div>
                <p className="max-w-[38ch] text-[15px] text-ink-2">
                  Las referencias que más salen hacia obra. Si buscas otra cosa, el catálogo
                  completo está justo debajo.
                </p>
              </div>
            </Reveal>

            <Stagger as="ul" className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {destacados.map((producto) => (
                <StaggerItem as="li" key={producto.id} className="min-w-0">
                  <ProductCard product={producto} showCategory />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/*
        Aquí había dos pasos antes de ver un artículo: un cinturón de categorías
        y, debajo, una rejilla de categorías con buscador. Las dos llevaban al
        mismo sitio y ninguna enseñaba producto, así que el catálogo se abría
        sin catálogo. Ahora los artículos están delante y las categorías al
        lado, donde sirven para acotar.
      */}
      <section className="page py-12 md:py-16">
        <CatalogBrowser
          categorias={categories.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            productCount: c.productCount,
          }))}
          productos={productos}
          hayDestacados={destacados.length > 0}
        />
      </section>

      <section className="lavado lavado-gris">
        <div className="page py-14 md:py-20">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="max-w-[24ch] text-[clamp(1.4rem,3vw,1.9rem)] leading-tight text-ink">
                ¿No encuentras una referencia?
              </h2>
              <p className="mt-3 max-w-[56ch] text-ink-2">
                Envíanos las especificaciones del proyecto y te cotizamos al mejor precio del
                mercado. Si ya tienes otra cotización, la mejoramos.
              </p>
            </div>
            <a
              href={whatsappLink(
                settings.whatsapp_primary,
                "Hola, busco una referencia que no vi en el catálogo.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary shrink-0"
            >
              Preguntar por WhatsApp
            </a>
          </div>

          <p className="mt-10 text-center text-[14px] text-ink-3">
            {site.claim}.{" "}
            <Link href="/contacto" className="font-semibold text-accent-ink hover:underline">
              Ver datos de contacto
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
