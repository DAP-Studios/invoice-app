import React from "react";
import "./Reports.css";

const Reports: React.FC = () => {
  return (
    <div className="reports-page">
      <h1 className="aurix-page-title">Reports</h1>
      <p className="page-subtitle">
        View and download your business reports with premium insights.
      </p>
      <div className="reports-content">
        <div className="report-card">
          <h2>Invoice Summary</h2>
          <p>Download a summary of all invoices generated.</p>
          <button className="aurix-btn">Download PDF</button>
        </div>
        <div className="report-card">
          <h2>Purchase Orders</h2>
          <p>Get a detailed report of all purchase orders.</p>
          <button className="aurix-btn">Download PDF</button>
        </div>
        <div className="report-card">
          <h2>Quotations</h2>
          <p>Access all sent quotations in one place.</p>
          <button className="aurix-btn">Download PDF</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
