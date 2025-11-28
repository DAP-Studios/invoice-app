import React from 'react';
import './Placeholder.css';

export const Quotations: React.FC = () => {
  return (
    <div className="placeholder-page">
      <h1>Quotations</h1>
      <p className="page-subtitle">Manage your quotations</p>
      <div className="placeholder-content">
        <p>💼 Quotations management feature coming soon!</p>
        <p>This page will show all quotations similar to the invoices list.</p>
      </div>
    </div>
  );
};

export const Customers: React.FC = () => {
  return (
    <div className="placeholder-page">
      <h1>Customers</h1>
      <p className="page-subtitle">Manage your customer database</p>
      <div className="placeholder-content">
        <p>👥 Customer management feature coming soon!</p>
        <p>Store and manage all your customer information in one place.</p>
      </div>
    </div>
  );
};

export const Reports: React.FC = () => {
  return (
    <div className="placeholder-page">
      <h1>Reports</h1>
      <p className="page-subtitle">View sales reports and analytics</p>
      <div className="placeholder-content">
        <p>📈 Reports and analytics feature coming soon!</p>
        <p>View detailed sales reports, revenue trends, and more.</p>
      </div>
    </div>
  );
};
