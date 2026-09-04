/**
 * Datos fijos de Distribuciones M.A.B.
 *
 * Todo lo de aquí sale del portafolio corporativo (PORTAFOLIO MAB 2026.pdf) o
 * de las piezas gráficas que entregó la empresa. No se inventa ni una cifra:
 * si un dato no está en el portafolio, no se publica.
 *
 * Los teléfonos, el correo y la dirección viven además en la tabla
 * `site_settings` para que el administrador pueda cambiarlos sin redespliegue.
 * Los valores de este archivo son el respaldo con el que arranca la base de
 * datos y lo que se muestra si la consulta falla.
 */

export const site = {
  name: "Distribuciones M.A.B",
  shortName: "MAB",
  nit: "1.055.830.162-7",
  tagline: "Transforma tu proyecto con acabados de excelencia",
  claim: "Te mejoramos el precio de cualquier cotización",
  yearsInMarket: 15,

  contact: {
    whatsappPrimary: "3102672577",
    whatsappSecondary: "3205668666",
    email: "miguelbui04@gmail.com",
    address: "La Sultana, Calle 68A #8-80",
    city: "Manizales",
    country: "Colombia",
  },

  /** Texto literal de la página 3 del portafolio. */
  mission:
    "Somos una organización que ofrece equipos para ferreterías y construcciones de alta calidad garantizada, de marcas establecidas en el mercado nacional e internacional.",
  vision:
    "Posicionarnos en el mercado como la más prestigiosa empresa distribuidora de implementos de ferretería y construcción de la ciudad y a nivel nacional.",

  /** Página 23 del portafolio. Son clientes reales; no se añade ninguno. */
  clients: [
    "Grupo Área",
    "Colpatria",
    "Mejía Villegas",
    "Super Havit",
    "Prabic",
    "Infante Vives",
    "Prodesa",
    "Mipko",
    "AD Arquitectos",
    "MB Gerencia y Construcciones",
    "Gran Morada",
    "CFC Constructora",
    "Puertas del Sol Constructora SAS",
  ],

  developer: {
    name: "Sealbyte",
    url: "https://sealbyte.co",
  },
} as const;

/** Formatea 3102672577 como "310 267 2577". */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) return raw;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/**
 * Enlace de WhatsApp con el mensaje ya escrito. El vendedor recibe el chat
 * sabiendo exactamente por qué artículo preguntan, que es la diferencia entre
 * un "hola" suelto y una cotización que avanza.
 */
export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("57") ? digits : `57${digits}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function productEnquiry(productName: string, url?: string): string {
  const base = `Hola, estoy interesado en el producto "${productName}".`;
  return url ? `${base} ${url}` : base;
}
