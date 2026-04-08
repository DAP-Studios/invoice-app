import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/explore", label: "Explore" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/invoices/new", label: "Create" },
  { to: "/templates", label: "Template" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { logout, session } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Aurix Smart Invoice
            </h1>
            <p className="text-xs text-slate-500">
              {session?.business?.business_name || "Business"}
            </p>
            {session?.access_token === "test-mode" ? (
              <p className="text-xs font-semibold text-amber-600">Test Mode</p>
            ) : null}
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith(item.to)
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
