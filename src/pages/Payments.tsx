import React from "react";
import "./Payments.css";

const Payments = () => {
  // Sample data for demonstration purposes
  const payments = {
    pending: [
      { id: 1, amount: 500, dueDate: "2025-12-30" },
      { id: 2, amount: 300, dueDate: "2026-01-05" },
    ],
    completed: [
      { id: 3, amount: 1000, completedDate: "2025-12-20" },
      { id: 4, amount: 750, completedDate: "2025-12-22" },
    ],
    delayed: [{ id: 5, amount: 200, dueDate: "2025-12-15" }],
  };

  return (
    <div className="payments-page">
      <h1>Payments</h1>

      <section>
        <h2>Pending Payments</h2>
        <ul>
          {payments.pending.map((payment) => (
            <li key={payment.id}>
              Payment ID: {payment.id}, Amount: ${payment.amount}, Due Date:{" "}
              {payment.dueDate}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Completed Payments</h2>
        <ul>
          {payments.completed.map((payment) => (
            <li key={payment.id}>
              Payment ID: {payment.id}, Amount: ${payment.amount}, Completed
              Date: {payment.completedDate}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Delayed Payments</h2>
        <ul>
          {payments.delayed.map((payment) => (
            <li key={payment.id}>
              Payment ID: {payment.id}, Amount: ${payment.amount}, Due Date:{" "}
              {payment.dueDate}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Payments;
