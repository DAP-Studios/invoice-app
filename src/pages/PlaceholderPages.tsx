import React, { useEffect, useState } from "react";
import { getCustomers } from "../services/firebaseService";
import "./Placeholder.css";

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
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="placeholder-page">
      <h1>Customers</h1>
      <p className="page-subtitle">Manage your customer database</p>
      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length > 0 ? (
        <table className="customer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No customers found.</p>
      )}
    </div>
  );
};
