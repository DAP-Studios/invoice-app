import { CSSProperties } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Invoice, InvoiceTemplate, Product, BusinessProfile } from "../types";
import { defaultTemplateConfig } from "../lib/defaults";
import { getApiBase } from "../lib/api";

type Props = {
  business: BusinessProfile | null;
  invoice: Invoice;
  template: InvoiceTemplate | null;
  suggestions: Product[];
  onTrack: (
    eventType: "product_click" | "reorder_click" | "invoice_view",
    productId?: string,
  ) => void;
};

export function InvoiceTemplateRenderer({
  business,
  invoice,
  template,
  suggestions,
  onTrack,
}: Props) {
  const config = template?.config || defaultTemplateConfig;
  const sections = new Map<string, JSX.Element>([
    [
      "header",
      <section
        key="header"
        className="flex items-center justify-between gap-3 border-b pb-3"
      >
        <div
          className={`flex w-full items-center gap-3 ${
            config.logoPosition === "center"
              ? "justify-center"
              : config.logoPosition === "right"
                ? "justify-end"
                : "justify-start"
          }`}
        >
          {business?.logo && (
            <img
              src={business.logo}
              alt="Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-extrabold">
              {business?.business_name || "Business"}
            </h2>
            <p className="text-xs opacity-80">
              GSTIN: {business?.gstin || "N/A"}
            </p>
            <p className="text-xs opacity-70">{business?.phone}</p>
          </div>
        </div>
      </section>,
    ],
    [
      "details",
      <section
        key="details"
        className="grid grid-cols-1 gap-2 rounded-xl bg-white/80 p-3 md:grid-cols-2"
      >
        <div>
          <p className="text-xs uppercase opacity-70">Invoice</p>
          <p className="font-semibold">#{invoice.invoice_number}</p>
          <p className="text-sm">Date: {invoice.date}</p>
        </div>
        <div>
          <p className="text-xs uppercase opacity-70">Customer</p>
          <p className="font-semibold">{invoice.customer_name}</p>
          <p className="text-sm">{invoice.customer_phone}</p>
          <p className="text-sm">Supply: {invoice.place_of_supply}</p>
        </div>
      </section>,
    ],
    [
      "items",
      <section key="items" className="rounded-xl border bg-white p-3">
        <h3 className="mb-2 font-semibold">Items</h3>
        <div className="space-y-2">
          {invoice.invoice_items.map((item, index) => (
            <div
              key={`${item.product_name}-${index}`}
              className="flex items-center justify-between gap-3 border-b pb-2 text-sm"
            >
              <div className="flex items-center gap-2">
                {config.showProductImages && item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                ) : null}
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs opacity-70">
                    Qty {item.quantity} x Rs. {item.unit_price}
                  </p>
                </div>
              </div>
              <p className="font-semibold">Rs. {item.line_total ?? 0}</p>
            </div>
          ))}
        </div>
      </section>,
    ],
    [
      "tax",
      <section key="tax" className="rounded-xl border bg-white p-3 text-sm">
        <h3 className="mb-2 font-semibold">Tax Breakdown</h3>
        <div className="grid grid-cols-2 gap-y-1">
          <span>CGST</span>
          <span className="text-right">Rs. {invoice.cgst}</span>
          <span>SGST</span>
          <span className="text-right">Rs. {invoice.sgst}</span>
          <span>IGST</span>
          <span className="text-right">Rs. {invoice.igst}</span>
        </div>
      </section>,
    ],
    [
      "total",
      <section key="total" className="rounded-xl border bg-white p-3">
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <span>Rs. {invoice.subtotal}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span>Tax</span>
          <span>Rs. {invoice.total_tax}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>Rs. {invoice.total_amount}</span>
        </div>
      </section>,
    ],
    [
      "suggestions",
      <section key="suggestions" className="rounded-xl border bg-white p-3">
        <h3 className="mb-2 font-semibold">Recommended Products</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {suggestions.slice(0, 5).map((product) => (
            <button
              key={product.id}
              onClick={() => onTrack("product_click", product.id)}
              className="rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50"
            >
              <p className="font-medium">{product.name}</p>
              <p className="text-xs opacity-70">Rs. {product.price}</p>
            </button>
          ))}
        </div>
      </section>,
    ],
    [
      "footer",
      <section
        key="footer"
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <button
          onClick={() => {
            onTrack("reorder_click");
            const list = invoice.invoice_items
              .map((item) => item.product_name)
              .join(", ");
            const text = encodeURIComponent(
              `Hi, I want to reorder these items: ${list}`,
            );
            window.open(`https://wa.me/?text=${text}`, "_blank");
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Reorder via WhatsApp
        </button>
        {config.showQrCode && (
          <div className="rounded-lg border bg-white p-2">
            <QRCodeSVG
              value={`${window.location.origin}/invoice/${invoice.id}`}
              size={72}
            />
          </div>
        )}
      </section>,
    ],
  ]);

  const style = {
    backgroundColor: config.colors.background,
    color: config.colors.text,
    fontFamily: config.fontFamily,
    borderColor: config.colors.accent,
  } as CSSProperties;

  const classByLayout =
    template?.layout === "classic-gst"
      ? "space-y-3 rounded-2xl border-2 p-4"
      : template?.layout === "minimal"
        ? "space-y-3 rounded-2xl border p-4"
        : "space-y-3 rounded-2xl border bg-gradient-to-b from-white to-cyan-50 p-4 shadow-sm";

  return (
    <div className={classByLayout} style={style}>
      {config.sectionOrder
        .map((section) => sections.get(section))
        .filter(Boolean)
        .map((node, idx) => (
          <div key={idx}>{node}</div>
        ))}
      <p className="text-xs opacity-60">
        Share URL: {getApiBase().replace(":4000", ":5173")}/invoice/{invoice.id}
      </p>
    </div>
  );
}
