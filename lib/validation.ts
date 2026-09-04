import { z } from "zod";

/**
 * Esquemas de validación compartidos.
 *
 * Los mismos límites que declara el esquema de Postgres, escritos una sola vez
 * y usados tanto para dar el mensaje de error en el formulario como para
 * rechazar en el servidor. Si alguien salta el formulario y llama a la acción
 * directamente, se topa con estas mismas reglas.
 */

const texto = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `No puede pasar de ${max} caracteres.`);

const opcional = (max: number) =>
  texto(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null));

export const categorySchema = z.object({
  name: texto(80).min(2, "El nombre necesita al menos 2 caracteres."),
  description: opcional(600),
});

export const productSchema = z.object({
  name: texto(120).min(2, "El nombre necesita al menos 2 caracteres."),
  categoryId: z.uuid("Elige una categoría."),
  description: opcional(2000),
  specs: opcional(200),
  isPublished: z.boolean(),
});

export const settingsSchema = z.object({
  whatsappPrimary: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "El WhatsApp principal son 10 dígitos, sin espacios ni indicativo."),
  whatsappSecondary: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "El segundo WhatsApp son 10 dígitos, sin espacios ni indicativo.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  email: z.email("Ese correo no tiene un formato válido.").max(160),
  address: texto(160).min(4, "Escribe la dirección completa."),
  city: texto(80).min(2, "Escribe la ciudad."),
  nit: texto(30).min(5, "Escribe el NIT."),
});

export const loginSchema = z.object({
  email: z.email("Escribe un correo válido."),
  password: z.string().min(8, "La contraseña tiene al menos 8 caracteres."),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

/**
 * Resultado uniforme de toda acción de servidor.
 *
 * Nunca se devuelve un fallo mudo: o hay datos, o hay un mensaje que el
 * formulario está obligado a mostrar. `fieldErrors` permite marcar el campo
 * concreto además del aviso general.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export function failure(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

export function success<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}
