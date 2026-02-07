import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import aurixLogo from "../assets/AurixLogo.png";
import aurixLogoShort from "../assets/logo.png";
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
  { path: "/app/quotation-list", label: "Quotations", icon: "💼" },
  { path: "/app/po-list", label: "All POs", icon: "📋" },
  { path: "/app/payments", label: "Payments", icon: "💳" },
  { path: "/app/customers", label: "Customers", icon: "👥" },
  { path: "/app/reports", label: "Reports", icon: "📈" },
  { path: "/app/settings", label: "Settings", icon: "⚙️" },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setIsCollapsed(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen((v) => !v);
    } else {
      setIsCollapsed((v) => !v);
    }
  };

  const handleNavClick = () => {
    if (isMobile) setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/app/login");
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${!isMobile && isCollapsed ? "collapsed" : ""} ${
          isMobile && isMobileOpen ? "mobile-open" : ""
        }`}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <img src={aurixLogo} className="aurix-logo" alt="Aurix Logo" />
            <div className="logo-small">
              <img src={aurixLogoShort} alt="Aurix" />
            </div>
          </div>

          {isMobile && (
            <button
              className="sidebar-close-btn"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              ✖
            </button>
          )}
        </div>

        {/* User Info */}
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar" aria-hidden="true">
              {user.username[0].toUpperCase()}
            </div>
            {(!isMobile || !isCollapsed) && (
              <div className="user-details">
                <p className="user-name">{user.username}</p>
                <p className="user-role">Administrator</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Primary">
          <ul className="nav-list">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${active ? "active" : ""}`}
                    onClick={handleNavClick}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    {(!isMobile || !isCollapsed) && (
                      <span className="nav-label">{item.label}</span>
                    )}
                    {active && (
                      <span className="active-indicator" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span aria-hidden="true">🚪</span>
            {(!isMobile || !isCollapsed) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
