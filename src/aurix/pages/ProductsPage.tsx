import { FormEvent, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { isTestModeSession, useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { uploadProductImage } from "../lib/firebaseStorage";
import {
  addTestProduct,
  deleteTestProduct,
  getTestProducts,
} from "../lib/testMode";
import { Product } from "../types";

export function ProductsPage() {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    if (!session) return;
    setLoading(true);
    try {
      if (isTestModeSession(session.access_token)) {
        setProducts(getTestProducts());
        return;
      }

      const data = await apiFetch<Product[]>("/products", {
        token: session.access_token,
      });
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, [session]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setError("");

    const form = event.currentTarget;
    const fd = new FormData(form);

    try {
      let imageUrl = "";
      const file = fd.get("image") as File | null;
      if (file && file.size > 0) {
        if (isTestModeSession(session.access_token)) {
          imageUrl = URL.createObjectURL(file);
        } else {
          imageUrl = await uploadProductImage(file);
        }
      }

      if (isTestModeSession(session.access_token)) {
        addTestProduct({
          name: String(fd.get("name")),
          price: Number(fd.get("price")),
          category: String(fd.get("category") || "General"),
          hsn_code: String(fd.get("hsn_code") || ""),
          image_url: imageUrl,
        });
        form.reset();
        await loadProducts();
        return;
      }

      await apiFetch<Product>("/products", {
        method: "POST",
        token: session.access_token,
        body: JSON.stringify({
          name: String(fd.get("name")),
          price: Number(fd.get("price")),
          category: String(fd.get("category") || "General"),
          hsn_code: String(fd.get("hsn_code") || ""),
          image_url: imageUrl,
        }),
      });

      form.reset();
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to add product");
    }
  }

  async function onDelete(productId: string) {
    if (!session) return;

    if (isTestModeSession(session.access_token)) {
      deleteTestProduct(productId);
      await loadProducts();
      return;
    }

    await apiFetch<void>(`/products/${productId}`, {
      method: "DELETE",
      token: session.access_token,
    });
    await loadProducts();
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Product Management</h2>

        <form
          onSubmit={onCreate}
          className="grid gap-2 rounded-xl border bg-white p-3 sm:grid-cols-2"
        >
          <input
            name="name"
            required
            placeholder="Product name"
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="price"
            required
            type="number"
            step="0.01"
            placeholder="Price"
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="category"
            placeholder="Category"
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="hsn_code"
            placeholder="HSN code"
            className="rounded-lg border p-3 text-sm"
          />
          <input
            name="image"
            type="file"
            accept="image/*"
            capture="environment"
            className="rounded-lg border p-2 text-sm sm:col-span-2"
          />
          <button className="rounded-lg bg-cyan-600 p-3 font-semibold text-white sm:col-span-2">
            Add product
          </button>
        </form>

        {error ? (
          <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="text-sm text-slate-500">Loading products...</p>
        ) : null}

        <div className="space-y-2">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex items-center justify-between rounded-xl border bg-white p-3"
            >
              <div className="flex items-center gap-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-slate-100" />
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.category} | HSN: {product.hsn_code || "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Rs. {product.price}</span>
                <button
                  onClick={() => onDelete(product.id)}
                  className="rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}
