import React from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../context/InvoiceContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { StatCard } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { formatCurrency } from "../utils/invoiceUtils";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { invoices } = useInvoices();
  const stats = useDashboardStats();

  const recentInvoices = invoices.slice(-5).reverse();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="aurix-dashboard-title">Aurix</h1>
          <p className="page-subtitle">Business Control Center</p>
        </div>
        <Button onClick={() => navigate("/app/create-invoice")}>
          + New Document
        </Button>
      </header>

      <div className="stats-grid">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          subtext="All time invoices"
        />
        <StatCard
          title="Total Quotations"
          value={stats.totalQuotations}
          subtext="All time quotations"
        />
        <StatCard
          title="Total POs"
          value={stats.totalPurchaseOrders}
          subtext="All time purchase orders"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtext="Paid invoices"
        />
        <StatCard
          title="Quotation Value"
          value={formatCurrency(stats.totalQuotationValue)}
          subtext="All quotations value"
        />
        <StatCard
          title="PO Value"
          value={formatCurrency(stats.totalPurchaseOrderValue)}
          subtext="All purchase orders value"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          subtext="Awaiting payment"
        />
        <StatCard
          title="Pending Quotations"
          value={stats.pendingQuotations}
          subtext="Pending quotations"
        />
        <StatCard
          title="Pending POs"
          value={stats.pendingPurchaseOrders}
          subtext="Pending POs"
        />
        <StatCard
          title="This Month Revenue"
          value={formatCurrency(stats.thisMonthRevenue)}
          subtext="Invoices this month"
        />
        <StatCard
          title="This Month Quotation"
          value={formatCurrency(stats.thisMonthQuotationValue)}
          subtext="Quotations this month"
        />
        <StatCard
          title="This Month PO"
          value={formatCurrency(stats.thisMonthPurchaseOrderValue)}
          subtext="POs this month"
        />
      </div>

      <section className="data-table-container">
        <div className="table-header">
          <h3 className="table-title">Recent Invoices</h3>
          <Button onClick={() => navigate("/invoices")}>View All</Button>
        </div>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-results">
                    No invoices yet. Create your first invoice!
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoiceNo}</td>
                    <td>{invoice.customerName}</td>
                    <td>{invoice.date}</td>
                    <td>{formatCurrency(invoice.totalAmount)}</td>
                    <td>
                      <Badge status={invoice.status} />
                    </td>
                    <td>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
