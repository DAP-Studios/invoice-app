import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { Invoice } from "../types";
import { formatCurrency } from "../utils/invoiceUtils";
import "./Payments.css";

interface PaymentData {
  pending: Invoice[];
  completed: Invoice[];
  delayed: Invoice[];
}

const Payments: React.FC = () => {
  const { invoices } = useInvoices();

  const paymentData: PaymentData = useMemo(() => {
    const now = new Date();
    const allInvoices = invoices.filter((inv) => inv.type === "INVOICE");

    const pending: Invoice[] = [];
    const completed: Invoice[] = [];
    const delayed: Invoice[] = [];

    allInvoices.forEach((invoice) => {
      const dueDate = new Date(invoice.dueDate.split("-").reverse().join("-"));

      if (invoice.status === "Paid") {
        completed.push(invoice);
      } else if (invoice.status === "Pending") {
        if (dueDate < now) {
          delayed.push(invoice);
        } else {
          pending.push(invoice);
        }
      }
    });

    return {
      pending: pending.sort(
        (a, b) =>
          new Date(a.dueDate.split("-").reverse().join("-")).getTime() -
          new Date(b.dueDate.split("-").reverse().join("-")).getTime()
      ),
      completed: completed.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      delayed: delayed.sort(
        (a, b) =>
          new Date(a.dueDate.split("-").reverse().join("-")).getTime() -
          new Date(b.dueDate.split("-").reverse().join("-")).getTime()
      ),
    };
  }, [invoices]);

  const calculateDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate.split("-").reverse().join("-"));
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate.split("-").reverse().join("-"));
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPending = paymentData.pending.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0
  );
  const totalDelayed = paymentData.delayed.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0
  );

  return (
    <div className="payments-page">
      <header className="payments-header">
        <div>
          <h1 className="aurix-page-title">Payments</h1>
          <p className="page-subtitle">
            Track and manage your invoice payments
          </p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="payment-summary">
        <div className="summary-card pending-card">
          <div className="summary-icon">⏰</div>
          <div className="summary-content">
            <h3>Pending Payments</h3>
            <p className="summary-amount">{formatCurrency(totalPending)}</p>
            <p className="summary-subtext">
              {paymentData.pending.length} invoices
            </p>
          </div>
        </div>
        <div className="summary-card delayed-card">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <h3>Overdue Payments</h3>
            <p className="summary-amount">{formatCurrency(totalDelayed)}</p>
            <p className="summary-subtext">
              {paymentData.delayed.length} invoices
            </p>
          </div>
        </div>
        <div className="summary-card completed-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h3>Completed Payments</h3>
            <p className="summary-amount">{paymentData.completed.length}</p>
            <p className="summary-subtext">All time paid invoices</p>
          </div>
        </div>
      </section>

      {/* Overdue Payments */}
      {paymentData.delayed.length > 0 && (
        <section className="payment-section overdue-section">
          <h2>⚠️ Overdue Payments</h2>
          <div className="payment-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Amount Due</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.delayed.map((payment) => (
                  <tr key={payment.id} className="overdue-row">
                    <td className="invoice-number">{payment.invoiceNo}</td>
                    <td>{payment.customerName}</td>
                    <td>{payment.dueDate}</td>
                    <td className="overdue-days">
                      {calculateDaysOverdue(payment.dueDate)} days
                    </td>
                    <td className="amount">
                      {formatCurrency(payment.totalAmount)}
                    </td>
                    <td className="contact">
                      {payment.customerEmail || payment.customerPhone || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pending Payments */}
      {paymentData.pending.length > 0 && (
        <section className="payment-section pending-section">
          <h2>⏰ Pending Payments</h2>
          <div className="payment-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Days Until Due</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.pending.map((payment) => {
                  const daysUntil = calculateDaysUntilDue(payment.dueDate);
                  return (
                    <tr key={payment.id}>
                      <td className="invoice-number">{payment.invoiceNo}</td>
                      <td>{payment.customerName}</td>
                      <td>{payment.dueDate}</td>
                      <td>
                        {daysUntil > 0 ? (
                          <span className="days-normal">{daysUntil} days</span>
                        ) : (
                          <span className="days-alert">Due Today</span>
                        )}
                      </td>
                      <td className="amount">
                        {formatCurrency(payment.totalAmount)}
                      </td>
                      <td>
                        <span className="status-badge pending">Pending</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Completed Payments */}
      {paymentData.completed.length > 0 && (
        <section className="payment-section completed-section">
          <h2>✅ Completed Payments</h2>
          <div className="payment-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Invoice Date</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.completed.slice(0, 10).map((payment) => (
                  <tr key={payment.id}>
                    <td className="invoice-number">{payment.invoiceNo}</td>
                    <td>{payment.customerName}</td>
                    <td>{payment.date}</td>
                    <td className="amount">
                      {formatCurrency(payment.totalAmount)}
                    </td>
                    <td>
                      <span className="status-badge paid">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paymentData.completed.length > 10 && (
            <p className="show-more">
              +{paymentData.completed.length - 10} more completed payments
            </p>
          )}
        </section>
      )}

      {/* Empty State */}
      {paymentData.pending.length === 0 &&
        paymentData.delayed.length === 0 &&
        paymentData.completed.length === 0 && (
          <section className="empty-state">
            <p>No invoices yet. Create your first invoice to track payments.</p>
          </section>
        )}
    </div>
  );
};

export default Payments;
