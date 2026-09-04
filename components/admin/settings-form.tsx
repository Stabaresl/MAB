"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { updateSettings } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/database.types";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setOk(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await updateSettings(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setOk("Datos actualizados. Ya se ven en el sitio.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-[620px]" noValidate>
      <div className="flex flex-col gap-6">
        <FormFeedback error={error} success={ok} />

        <fieldset className="flex flex-col gap-6 rounded-lg border border-hairline bg-surface-1 p-6">
          <legend className="label px-2 text-ink-subtle">WhatsApp</legend>

          <div>
            <label htmlFor="whatsappPrimary" className="label block text-ink-subtle">
              Número principal
            </label>
            <input
              id="whatsappPrimary"
              name="whatsappPrimary"
              type="tel"
              inputMode="numeric"
              required
              defaultValue={settings.whatsapp_primary}
              aria-invalid={Boolean(fieldErrors.whatsappPrimary)}
              className="field spec mt-2"
              placeholder="3102672577"
            />
            <p className="mt-1.5 text-[13px] text-ink-subtle">
              10 dígitos, sin espacios ni indicativo. Es el número del botón de cada artículo.
            </p>
            <FieldError message={fieldErrors.whatsappPrimary} />
          </div>

          <div>
            <label htmlFor="whatsappSecondary" className="label block text-ink-subtle">
              Segundo número <span className="normal-case tracking-normal">(opcional)</span>
            </label>
            <input
              id="whatsappSecondary"
              name="whatsappSecondary"
              type="tel"
              inputMode="numeric"
              defaultValue={settings.whatsapp_secondary ?? ""}
              aria-invalid={Boolean(fieldErrors.whatsappSecondary)}
              className="field spec mt-2"
              placeholder="3205668666"
            />
            <FieldError message={fieldErrors.whatsappSecondary} />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-6 rounded-lg border border-hairline bg-surface-1 p-6">
          <legend className="label px-2 text-ink-subtle">Datos de la empresa</legend>

          <div>
            <label htmlFor="email" className="label block text-ink-subtle">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={settings.email}
              aria-invalid={Boolean(fieldErrors.email)}
              className="field mt-2"
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <label htmlFor="address" className="label block text-ink-subtle">
              Dirección
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              defaultValue={settings.address}
              aria-invalid={Boolean(fieldErrors.address)}
              className="field mt-2"
            />
            <FieldError message={fieldErrors.address} />
          </div>

          <div>
            <label htmlFor="city" className="label block text-ink-subtle">
              Ciudad
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              defaultValue={settings.city}
              aria-invalid={Boolean(fieldErrors.city)}
              className="field mt-2"
            />
            <FieldError message={fieldErrors.city} />
          </div>

          <div>
            <label htmlFor="nit" className="label block text-ink-subtle">
              NIT
            </label>
            <input
              id="nit"
              name="nit"
              type="text"
              required
              defaultValue={settings.nit}
              aria-invalid={Boolean(fieldErrors.nit)}
              className="field spec mt-2"
            />
            <FieldError message={fieldErrors.nit} />
          </div>
        </fieldset>
      </div>

      <div className="mt-8 border-t border-hairline pt-6">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
