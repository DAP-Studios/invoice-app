import { FormEvent, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { isTestModeSession, useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { defaultTemplateConfig } from "../lib/defaults";
import { getTestTemplate, saveTestTemplate } from "../lib/testMode";
import { InvoiceTemplate, LayoutType, TemplateConfig } from "../types";

export function TemplatesPage() {
  const { session } = useAuth();
  const [template, setTemplate] = useState<InvoiceTemplate | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      if (!session) return;

      if (isTestModeSession(session.access_token)) {
        setTemplate(getTestTemplate());
        return;
      }

      const all = await apiFetch<InvoiceTemplate[]>("/templates", {
        token: session.access_token,
      });
      setTemplate(all[0] || null);
    }
    void load();
  }, [session]);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const fd = new FormData(event.currentTarget);
    const payload: {
      name: string;
      layout: LayoutType;
      config: TemplateConfig;
      is_active: boolean;
    } = {
      name: String(fd.get("name") || "My Template"),
      layout: String(fd.get("layout") || "modern-card") as LayoutType,
      config: {
        colors: {
          primary: String(
            fd.get("primary") || defaultTemplateConfig.colors.primary,
          ),
          accent: String(
            fd.get("accent") || defaultTemplateConfig.colors.accent,
          ),
          text: String(fd.get("text") || defaultTemplateConfig.colors.text),
          background: String(
            fd.get("background") || defaultTemplateConfig.colors.background,
          ),
        },
        fontFamily: String(
          fd.get("fontFamily") || defaultTemplateConfig.fontFamily,
        ),
        logoPosition: String(
          fd.get("logoPosition") || defaultTemplateConfig.logoPosition,
        ) as "left" | "center" | "right",
        sectionOrder: String(
          fd.get("sectionOrder") ||
            defaultTemplateConfig.sectionOrder.join(","),
        )
          .split(",")
          .map((v) => v.trim()),
        showProductImages: Boolean(fd.get("showProductImages")),
        showQrCode: Boolean(fd.get("showQrCode")),
        showSuggestions: Boolean(fd.get("showSuggestions")),
      },
      is_active: true,
    };

    if (isTestModeSession(session.access_token)) {
      const saved = saveTestTemplate({
        ...payload,
        id: template?.id,
      });
      setTemplate(saved);
      setStatus(template ? "Template updated" : "Template created");
      return;
    }

    if (template) {
      const updated = await apiFetch<InvoiceTemplate>(
        `/templates/${template.id}`,
        {
          method: "PUT",
          token: session.access_token,
          body: JSON.stringify(payload),
        },
      );
      setTemplate(updated);
      setStatus("Template updated");
    } else {
      const created = await apiFetch<InvoiceTemplate>("/templates", {
        method: "POST",
        token: session.access_token,
        body: JSON.stringify(payload),
      });
      setTemplate(created);
      setStatus("Template created");
    }
  }

  const config = template?.config || defaultTemplateConfig;

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Invoice Template Builder</h2>
        <p className="text-sm text-slate-600">
          Configure colors, font, sections, and optional blocks for dynamic
          invoice rendering.
        </p>

        <form
          onSubmit={onSave}
          className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-2"
        >
          <input
            name="name"
            defaultValue={template?.name || "Aurix Template"}
            placeholder="Template name"
            className="rounded-lg border p-3 text-sm"
          />
          <select
            name="layout"
            defaultValue={template?.layout || "modern-card"}
            className="rounded-lg border p-3 text-sm"
          >
            <option value="minimal">Minimal</option>
            <option value="modern-card">Modern card</option>
            <option value="classic-gst">Classic GST</option>
          </select>

          <input
            name="primary"
            type="color"
            defaultValue={config.colors.primary}
            className="h-12 rounded-lg border p-2"
          />
          <input
            name="accent"
            type="color"
            defaultValue={config.colors.accent}
            className="h-12 rounded-lg border p-2"
          />
          <input
            name="text"
            type="color"
            defaultValue={config.colors.text}
            className="h-12 rounded-lg border p-2"
          />
          <input
            name="background"
            type="color"
            defaultValue={config.colors.background}
            className="h-12 rounded-lg border p-2"
          />

          <input
            name="fontFamily"
            defaultValue={config.fontFamily}
            placeholder="Font family"
            className="rounded-lg border p-3 text-sm sm:col-span-2"
          />

          <select
            name="logoPosition"
            defaultValue={config.logoPosition}
            className="rounded-lg border p-3 text-sm"
          >
            <option value="left">Logo left</option>
            <option value="center">Logo center</option>
            <option value="right">Logo right</option>
          </select>

          <input
            name="sectionOrder"
            defaultValue={config.sectionOrder.join(",")}
            placeholder="header,details,items,tax,total,suggestions,footer"
            className="rounded-lg border p-3 text-sm"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              name="showProductImages"
              type="checkbox"
              defaultChecked={config.showProductImages}
            />{" "}
            Show product images
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="showQrCode"
              type="checkbox"
              defaultChecked={config.showQrCode}
            />{" "}
            Show QR code
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              name="showSuggestions"
              type="checkbox"
              defaultChecked={config.showSuggestions}
            />{" "}
            Show product suggestions
          </label>

          <button className="rounded-lg bg-cyan-600 p-3 font-semibold text-white sm:col-span-2">
            Save template
          </button>
        </form>

        {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
      </div>
    </Layout>
  );
}
