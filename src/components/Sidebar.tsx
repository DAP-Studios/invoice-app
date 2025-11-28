import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: "/app", label: "Dashboard", icon: "📊" },
  { path: "/app/create-invoice", label: "Create Invoice", icon: "➕" },
  { path: "/app/invoices", label: "All Invoices", icon: "📄" },
  { path: "/app/quotations", label: "Quotations", icon: "💼" },
  { path: "/app/customers", label: "Customers", icon: "👥" },
  { path: "/app/reports", label: "Reports", icon: "📈" },
  { path: "/app/settings", label: "Settings", icon: "⚙️" },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Sales ERP</h2>
        <p>Invoice & Quotation Manager</p>
        {user && (
          <div className="user-info">
            <span className="user-badge">👤 {user.username}</span>
          </div>
        )}
      </div>
      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
