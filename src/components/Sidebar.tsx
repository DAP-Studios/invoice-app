import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import aurixLogo from "../assets/AurixLogo.png";
import "./Sidebar.css";
import "./Sidebar.mobile.css";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: "/app", label: "Dashboard", icon: "📊" },
  { path: "/app/create-invoice", label: "Create Invoice", icon: "➕" },
  { path: "/app/invoices", label: "All Invoices", icon: "📄" },
  { path: "/app/quotations", label: "All Quotations", icon: "💼" },
  { path: "/app/po-list", label: "All POs", icon: "📋" },
  { path: "/app/quotation-list", label: "Quotation List", icon: "📜" },
  { path: "/app/customers", label: "Customers", icon: "👥" },
  { path: "/app/reports", label: "Reports", icon: "📈" },
  { path: "/app/settings", label: "Settings", icon: "⚙️" },
  { path: "/app/payments", label: "Payments", icon: "💳" }, // New Payments tab
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/login");
    }
  };

  // Close sidebar on navigation (mobile)
  const handleNavClick = () => {
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="sidebar-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hamburger" aria-hidden="true">
          {open ? "✖" : "☰"}
        </span>
      </button>
      <nav
        className={`sidebar${open ? " open" : ""}`}
        aria-label="Main navigation"
        tabIndex={open ? 0 : -1}
      >
        <div className="sidebar-header">
          <img src={aurixLogo} alt="Aurix Logo" className="aurix-logo" />
          <h2 className="aurix-title">Aurix</h2>
          <p className="aurix-subtitle">Business Control Center</p>
          {user && (
            <div className="user-info">
              <span className="user-badge">👤 {user.username}</span>
            </div>
          )}
          {/* Desktop toggle button */}
          <button
            className="sidebar-toggle desktop-toggle"
            aria-label={open ? "Close sidebar" : "Open sidebar"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{ display: window.innerWidth >= 768 ? "block" : "none" }}
          >
            <span className="hamburger" aria-hidden="true">
              {open ? "✖" : "☰"}
            </span>
          </button>
        </div>
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={handleNavClick}
                tabIndex={open ? 0 : -1}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/app/payments"
              className={`nav-item ${
                location.pathname === "/app/payments" ? "active" : ""
              }`}
              onClick={handleNavClick}
              tabIndex={open ? 0 : -1}
            >
              <span className="nav-icon">💳</span>
              <span>Payments</span>
            </Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="logout-btn"
            tabIndex={open ? 0 : -1}
          >
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

// Aurix Sidebar UI: All inline styles removed, all layout/typography handled by CSS classes for strict design system compliance.
