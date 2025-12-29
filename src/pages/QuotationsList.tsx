import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../context/InvoiceContext";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { formatCurrency } from "../utils/invoiceUtils";
import "./InvoicesList.css"; // Updated to use enhanced styles

export const QuotationsList: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, deleteInvoice } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredQuotations = invoices
    .filter((inv) => inv.type === "QUOTATION")
    .filter((inv) => {
      const matchesSearch =
        inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .reverse();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      deleteInvoice(id);
    }
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1 className="aurix-page-title">All Quotations</h1>
          <p className="page-subtitle">Manage and view all your quotations</p>
        </div>
        <Button onClick={() => navigate("/app/create-invoice")}>
          ＋ Create New Quotation
        </Button>
      </div>

      <div className="search-filter-bar">
        <h3>Search & Filter</h3>
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Search by quotation# or customer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-input"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Quotation #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-results">
                    No quotations found
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id}>
                    <td>{quotation.invoiceNo}</td>
                    <td>{quotation.customerName}</td>
                    <td>{quotation.date}</td>
                    <td>{quotation.dueDate}</td>
                    <td>{formatCurrency(quotation.totalAmount)}</td>
                    <td>
                      <Badge status={quotation.status} />
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => navigate(`/invoices/${quotation.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleDelete(quotation.id)}
                        >
                          Delete
                        </Button>
                      </div>
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
