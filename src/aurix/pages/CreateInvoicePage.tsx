import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { isTestModeSession, useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { createTestInvoice, getTestProducts } from "../lib/testMode";
import { Product } from "../types";

type DraftItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  product_id?: string;
  image_url?: string;
  hsn_code?: string;
  category?: string;
};

export function CreateInvoicePage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<DraftItem[]>([
    { product_name: "", quantity: 1, unit_price: 0, tax_rate: 18 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      if (!session) return;

      if (isTestModeSession(session.access_token)) {
        setProducts(getTestProducts());
        return;
      }

      const data = await apiFetch<Product[]>("/products", {
        token: session.access_token,
      });
      setProducts(data);
    }
    void loadProducts();
  }, [session]);

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { product_name: "", quantity: 1, unit_price: 0, tax_rate: 18 },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function autoMatch(name: string, index: number) {
    const matched = products.find(
      (product) => product.name.toLowerCase() === name.toLowerCase(),
    );
    if (!matched) return;
    updateItem(index, {
      product_name: matched.name,
      unit_price: Number(matched.price),
      product_id: matched.id,
      image_url: matched.image_url,
      hsn_code: matched.hsn_code,
      category: matched.category,
    });
  }

  const subtotalPreview = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [items],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setLoading(true);
    setError("");

    const fd = new FormData(event.currentTarget);

    try {
      if (isTestModeSession(session.access_token)) {
        const created = createTestInvoice({
          date: String(fd.get("date")),
          customer_name: String(fd.get("customer_name")),
          customer_phone: String(fd.get("customer_phone")),
          customer_email: String(fd.get("customer_email") || ""),
          customer_address: String(fd.get("customer_address") || ""),
          place_of_supply: String(fd.get("place_of_supply")),
          is_inter_state: Boolean(fd.get("is_inter_state")),
          notes: String(fd.get("notes") || ""),
          items,
        });
        navigate(`/invoice/${created.id}`);
        return;
      }

      const invoice = await apiFetch<{ id: string }>("/invoices", {
        method: "POST",
        token: session.access_token,
        body: JSON.stringify({
          date: String(fd.get("date")),
          customer_name: String(fd.get("customer_name")),
          customer_phone: String(fd.get("customer_phone")),
          customer_email: String(fd.get("customer_email") || ""),
          customer_address: String(fd.get("customer_address") || ""),
          place_of_supply: String(fd.get("place_of_supply")),
          is_inter_state: Boolean(fd.get("is_inter_state")),
          notes: String(fd.get("notes") || ""),
          items,
        }),
      });

      navigate(`/invoice/${invoice.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">Create GST Invoice</h2>

        <section className="grid gap-2 rounded-xl border bg-white p-3 sm:grid-cols-2">
          <input
            name="date"
            type="date"
            required
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="place_of_supply"
            required
            placeholder="Place of supply"
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="customer_name"
            required
            placeholder="Customer name"
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="customer_phone"
            required
            placeholder="Customer phone"
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="customer_email"
            placeholder="Customer email"
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="customer_address"
            placeholder="Customer address"
            className="rounded-lg border p-3 text-sm"
          />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input name="is_inter_state" type="checkbox" /> Inter-state supply
            (apply IGST)
          </label>
          <textarea
            name="notes"
            placeholder="Notes"
            className="rounded-lg border p-3 text-sm sm:col-span-2"
          />
        </section>

        <section className="space-y-2 rounded-xl border bg-white p-3">
          <h3 className="font-semibold">Products</h3>
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-lg border p-2 sm:grid-cols-5"
            >
              <input
                value={item.product_name}
                onChange={(e) =>
                  updateItem(index, { product_name: e.target.value })
                }
                onBlur={(e) => autoMatch(e.target.value, index)}
                list="product-suggestions"
                placeholder="Product name"
                className="rounded-lg border p-2 text-sm sm:col-span-2"
              />
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, { quantity: Number(e.target.value) })
                }
                className="rounded-lg border p-2 text-sm"
              />
              <input
                type="number"
                step="0.01"
                min={0}
                value={item.unit_price}
                onChange={(e) =>
                  updateItem(index, { unit_price: Number(e.target.value) })
                }
                className="rounded-lg border p-2 text-sm"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={item.tax_rate}
                  onChange={(e) =>
                    updateItem(index, { tax_rate: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border p-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded bg-rose-100 px-2 py-2 text-xs text-rose-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <datalist id="product-suggestions">
            {products.map((product) => (
              <option key={product.id} value={product.name} />
            ))}
          </datalist>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              + Add item
            </button>
            <p className="text-sm font-semibold">
              Subtotal preview: Rs. {subtotalPreview.toFixed(2)}
            </p>
          </div>
        </section>

        {error ? (
          <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-cyan-600 p-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create invoice"}
        </button>
      </form>
    </Layout>
  );
}
