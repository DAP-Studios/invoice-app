import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { StatCard } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { formatCurrency } from '../utils/invoiceUtils';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { invoices } = useInvoices();
  const stats = useDashboardStats();

  const recentInvoices = invoices.slice(-5).reverse();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="page-subtitle">Overview of your sales and invoicing activities</p>

      <div className="stats-grid">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          subtext="All time invoices created"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtext="From paid invoices"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          subtext="Awaiting payment"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats.thisMonthRevenue)}
          subtext="Revenue this month"
        />
      </div>

      <div className="data-table-container">
        <div className="table-header">
          <h3>Recent Invoices</h3>
          <Button onClick={() => navigate('/create-invoice')}>
            Create New
          </Button>
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
      </div>
    </div>
  );
};
