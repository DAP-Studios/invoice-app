import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { isTestModeSession, useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { getTestAnalyticsSummary } from "../lib/testMode";
import { AnalyticsSummary } from "../types";

export function DashboardPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!session) return;
      setLoading(true);
      setError("");
      try {
        if (isTestModeSession(session.access_token)) {
          setSummary(getTestAnalyticsSummary());
          return;
        }

        const data = await apiFetch<AnalyticsSummary>("/analytics/summary", {
          token: session.access_token,
        });
        setSummary(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load analytics");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [session]);

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Analytics Dashboard</h2>

        {loading ? (
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        ) : null}
        {error ? (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {summary ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Card title="Total invoices" value={summary.totalInvoices} />
              <Card title="Repeat customers" value={summary.repeatCustomers} />
              <Card title="Invoice views" value={summary.invoiceViews} />
              <Card title="Conversion" value={`${summary.conversionRate}%`} />
            </div>

            <section className="rounded-xl border bg-white p-4">
              <h3 className="mb-3 font-semibold">Top products</h3>
              <div className="space-y-2">
                {summary.topProducts.length ? (
                  summary.topProducts.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-sm"
                    >
                      <span>{item.name}</span>
                      <span className="font-semibold">{item.qty}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No product activity yet.
                  </p>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </Layout>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
