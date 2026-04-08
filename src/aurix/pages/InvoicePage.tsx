import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { InvoiceTemplateRenderer } from "../components/InvoiceTemplateRenderer";
import { isTestModeSession, useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import {
  getEffectiveTemplate,
  getTestBusiness,
  getTestInvoiceById,
  getTestProducts,
} from "../lib/testMode";
import { BusinessProfile, Invoice, InvoiceTemplate, Product } from "../types";

type InvoiceResponse = {
  invoice: Invoice;
  business: BusinessProfile | null;
  template: InvoiceTemplate | null;
  suggestions: Product[];
};

export function InvoicePage() {
  const { id } = useParams();
  const { session } = useAuth();
  const [data, setData] = useState<InvoiceResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!session || !id) return;
      setLoading(true);
      setError("");

      try {
        if (isTestModeSession(session.access_token)) {
          const invoice = getTestInvoiceById(id);
          if (!invoice) {
            throw new Error("Test invoice not found");
          }

          setData({
            invoice,
            business: getTestBusiness(),
            template: getEffectiveTemplate(),
            suggestions: getTestProducts().slice(0, 5),
          });
          return;
        }

        const invoice = await apiFetch<InvoiceResponse>(`/invoices/${id}`, {
          token: session.access_token,
        });
        setData(invoice);

        await apiFetch("/analytics/events", {
          method: "POST",
          token: session.access_token,
          body: JSON.stringify({ event_type: "invoice_view", invoice_id: id }),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load invoice");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id, session]);

  async function track(
    eventType: "product_click" | "reorder_click" | "invoice_view",
    productId?: string,
  ) {
    if (!session || !id) return;

    if (isTestModeSession(session.access_token)) {
      return;
    }

    await apiFetch("/analytics/events", {
      method: "POST",
      token: session.access_token,
      body: JSON.stringify({
        event_type: eventType,
        invoice_id: id,
        product_id: productId || null,
      }),
    });
  }

  return (
    <Layout>
      {loading ? (
        <p className="text-sm text-slate-500">Loading invoice...</p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {data ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Print / Save PDF
            </button>
          </div>
          <InvoiceTemplateRenderer
            business={data.business}
            invoice={data.invoice}
            template={data.template}
            suggestions={data.suggestions}
            onTrack={track}
          />
        </div>
      ) : null}
    </Layout>
  );
}
