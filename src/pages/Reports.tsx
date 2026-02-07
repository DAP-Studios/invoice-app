import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { Button } from "../components/Button";
import { formatCurrency } from "../utils/invoiceUtils";
import {
  exportInvoiceSummaryCSV,
  exportPaymentsCSV,
} from "../utils/exportUtils";
import "./Reports.css";

interface ReportData {
  totalInvoices: number;
  totalQuotations: number;
  totalPOs: number;
  totalRevenue: number;
  totalQuotationValue: number;
  totalPOValue: number;
  pendingAmount: number;
  paidAmount: number;
  invoicesByStatus: { paid: number; pending: number; draft: number };
  thisMonthRevenue: number;
  monthlyTrend: Array<{ month: string; revenue: number }>;
}

const Reports: React.FC = () => {
  const { invoices } = useInvoices();

  const reportData: ReportData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter invoices
    const allInvoices = invoices.filter((inv) => inv.type === "INVOICE");
    const allQuotations = invoices.filter((inv) => inv.type === "QUOTATION");
    const allPOs = invoices.filter((inv) => inv.type === "PURCHASE ORDER");
    const paidInvoices = allInvoices.filter((inv) => inv.status === "Paid");
    const pendingInvoices = allInvoices.filter(
      (inv) => inv.status === "Pending"
    );
    const thisMonthInvoices = allInvoices.filter((inv) => {
      const invDate = new Date(inv.date.split("-").reverse().join("-"));
      return (
        invDate.getMonth() === currentMonth &&
        invDate.getFullYear() === currentYear
      );
    });

    // Calculate totals
    const totalRevenue = paidInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    const totalQuotationValue = allQuotations.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    const totalPOValue = allPOs.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingAmount = pendingInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    const thisMonthRevenue = thisMonthInvoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Calculate monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthName = monthDate.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const monthRevenue = allInvoices
        .filter((inv) => {
          const invDate = new Date(inv.date.split("-").reverse().join("-"));
          return (
            invDate.getMonth() === monthDate.getMonth() &&
            invDate.getFullYear() === monthDate.getFullYear() &&
            inv.status === "Paid"
          );
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      monthlyTrend.push({ month: monthName, revenue: monthRevenue });
    }

    return {
      totalInvoices: allInvoices.length,
      totalQuotations: allQuotations.length,
      totalPOs: allPOs.length,
      totalRevenue,
      totalQuotationValue,
      totalPOValue,
      pendingAmount,
      paidAmount: totalRevenue,
      invoicesByStatus: {
        paid: paidInvoices.length,
        pending: pendingInvoices.length,
        draft: allInvoices.filter((inv) => inv.status === "Draft").length,
      },
      thisMonthRevenue,
      monthlyTrend,
    };
  }, [invoices]);

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <h1 className="aurix-page-title">Reports & Analytics</h1>
          <p className="page-subtitle">
            View comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="export-buttons">
          <Button
            variant="secondary"
            onClick={() => exportInvoiceSummaryCSV(invoices)}
          >
            📥 Export Summary
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportPaymentsCSV(invoices)}
          >
            💳 Export Payments
          </Button>
        </div>
      </header>

      {/* Revenue Overview */}
      <section className="report-section">
        <h2>Revenue Overview</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Revenue (Paid)</h3>
            <p className="metric-value">
              {formatCurrency(reportData.paidAmount)}
            </p>
            <p className="metric-subtext">
              {reportData.invoicesByStatus.paid} paid invoices
            </p>
          </div>
          <div className="metric-card">
            <h3>Pending Amount</h3>
            <p className="metric-value pending">
              {formatCurrency(reportData.pendingAmount)}
            </p>
            <p className="metric-subtext">
              {reportData.invoicesByStatus.pending} pending invoices
            </p>
          </div>
          <div className="metric-card">
            <h3>This Month Revenue</h3>
            <p className="metric-value">
              {formatCurrency(reportData.thisMonthRevenue)}
            </p>
            <p className="metric-subtext">Current month</p>
          </div>
          <div className="metric-card">
            <h3>Total Quotation Value</h3>
            <p className="metric-value">
              {formatCurrency(reportData.totalQuotationValue)}
            </p>
            <p className="metric-subtext">
              {reportData.totalQuotations} quotations
            </p>
          </div>
        </div>
      </section>

      {/* Invoice Statistics */}
      <section className="report-section">
        <h2>Invoice Statistics</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">{reportData.totalInvoices}</div>
            <div className="stat-label">Total Invoices</div>
          </div>
          <div className="stat-box paid">
            <div className="stat-number">
              {reportData.invoicesByStatus.paid}
            </div>
            <div className="stat-label">Paid</div>
          </div>
          <div className="stat-box pending">
            <div className="stat-number">
              {reportData.invoicesByStatus.pending}
            </div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-box draft">
            <div className="stat-number">
              {reportData.invoicesByStatus.draft}
            </div>
            <div className="stat-label">Draft</div>
          </div>
        </div>
      </section>

      {/* Document Types */}
      <section className="report-section">
        <h2>Document Summary</h2>
        <div className="document-grid">
          <div className="doc-card">
            <h3>Invoices</h3>
            <p className="doc-count">{reportData.totalInvoices}</p>
            <p className="doc-value">
              {formatCurrency(reportData.totalRevenue)} (Paid)
            </p>
          </div>
          <div className="doc-card">
            <h3>Quotations</h3>
            <p className="doc-count">{reportData.totalQuotations}</p>
            <p className="doc-value">
              {formatCurrency(reportData.totalQuotationValue)}
            </p>
          </div>
          <div className="doc-card">
            <h3>Purchase Orders</h3>
            <p className="doc-count">{reportData.totalPOs}</p>
            <p className="doc-value">
              {formatCurrency(reportData.totalPOValue)}
            </p>
          </div>
        </div>
      </section>

      {/* Monthly Trend */}
      <section className="report-section">
        <h2>Revenue Trend (Last 6 Months)</h2>
        <div className="trend-table">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {reportData.monthlyTrend.map((item, index) => (
                <tr key={index}>
                  <td>{item.month}</td>
                  <td>{formatCurrency(item.revenue)}</td>
                  <td>
                    {item.revenue > 0 ? (
                      <span className="trend-up">📈 Active</span>
                    ) : (
                      <span className="trend-neutral">➖ No sales</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Insights */}
      <section className="report-section">
        <h2>Quick Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-icon">💰</span>
            <p>
              You have{" "}
              <strong>{formatCurrency(reportData.pendingAmount)}</strong> in
              pending payments
            </p>
          </div>
          <div className="insight-card">
            <span className="insight-icon">📊</span>
            <p>
              Average invoice value:{" "}
              <strong>
                {reportData.totalInvoices > 0
                  ? formatCurrency(
                      reportData.paidAmount / reportData.invoicesByStatus.paid
                    )
                  : "₹ 0.00"}
              </strong>
            </p>
          </div>
          <div className="insight-card">
            <span className="insight-icon">📈</span>
            <p>
              This month's revenue:{" "}
              <strong>{formatCurrency(reportData.thisMonthRevenue)}</strong>
            </p>
          </div>
          <div className="insight-card">
            <span className="insight-icon">🎯</span>
            <p>
              Invoice completion rate:{" "}
              <strong>
                {reportData.totalInvoices > 0
                  ? Math.round(
                      (reportData.invoicesByStatus.paid /
                        reportData.totalInvoices) *
                        100
                    )
                  : 0}
                %
              </strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
