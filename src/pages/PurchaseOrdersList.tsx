import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../context/InvoiceContext";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { formatCurrency } from "../utils/invoiceUtils";
import "./InvoicesList.css"; // Updated to use enhanced styles

export const PurchaseOrdersList: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, deleteInvoice } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredPOs = invoices
    .filter((inv) => inv.type === "PURCHASE ORDER")
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
    if (confirm("Are you sure you want to delete this purchase order?")) {
      deleteInvoice(id);
    }
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1 className="aurix-page-title">All Purchase Orders</h1>
          <p className="page-subtitle">
            Manage and view all your purchase orders
          </p>
        </div>
        <Button onClick={() => navigate("/app/create-invoice")}>
          ＋ Create New Purchase Order
        </Button>
      </div>

      <div className="search-filter-bar">
        <h3>Search & Filter</h3>
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Search by PO# or customer"
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
                <th>PO #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-results">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr key={po.id}>
                    <td>{po.invoiceNo}</td>
                    <td>{po.customerName}</td>
                    <td>{po.date}</td>
                    <td>{po.dueDate}</td>
                    <td>{formatCurrency(po.totalAmount)}</td>
                    <td>
                      <Badge status={po.status} />
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => navigate(`/invoices/${po.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleDelete(po.id)}
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
