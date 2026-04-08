import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function ExplorePage() {
  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Explore Test Mode</h2>
        <p className="text-sm text-slate-600">
          Use this mode to try the product, template, and invoice generation
          flow without logging into Firebase.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            to="/products"
            className="rounded-xl border bg-white p-4 hover:bg-slate-50"
          >
            <p className="font-semibold">1. Add Products</p>
            <p className="text-sm text-slate-500">
              Create test products quickly.
            </p>
          </Link>
          <Link
            to="/templates"
            className="rounded-xl border bg-white p-4 hover:bg-slate-50"
          >
            <p className="font-semibold">2. Customize Template</p>
            <p className="text-sm text-slate-500">
              Pick style, colors and section order.
            </p>
          </Link>
          <Link
            to="/invoices/new"
            className="rounded-xl border bg-white p-4 hover:bg-slate-50"
          >
            <p className="font-semibold">3. Generate Invoice</p>
            <p className="text-sm text-slate-500">
              Build and view a shareable invoice page.
            </p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
