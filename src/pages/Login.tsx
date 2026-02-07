import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import "./Login.css";

// Check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return !!(apiKey && apiKey.trim() && apiKey.length > 10);
};

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      // Signup validation
      if (!username || !email || !phone || !password) {
        setError("Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        setError("Password should be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setLoading(true);
      try {
        const result = await signup({
          username,
          email,
          phone,
          password,
        });
        if (result.success) {
          navigate("/app");
        } else {
          setError(result.error || "Signup failed");
        }
      } catch (err) {
        setError("Signup failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Login with any credential (username, email, or phone)
      if (!email || !password) {
        setError("Please enter credentials and password");
        return;
      }

      setLoading(true);
      try {
        console.log("Login attempt with:", { credential: email.trim() });
        const success = await login(email, password);
        if (success) {
          console.log("✅ Login successful, navigating to /app");
          navigate("/app");
        } else {
          console.log("❌ Login failed - invalid credentials");
          setError("❌ Invalid credentials. Try: admin / admin123");
        }
      } catch (err) {
        console.error("Login exception:", err);
        setError("Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="aurix-page-title">Aurix</h1>
          <p className="page-subtitle">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">⚠️ {error}</div>}

          {isSignup ? (
            <>
              {/* Signup Form Fields */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username (3-20 chars)"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                />
              </div>
            </>
          ) : (
            <>
              {/* Login Form Fields */}
              <div className="form-group">
                <label htmlFor="credential">Username, Email, or Phone</label>
                <input
                  type="text"
                  id="credential"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin (or your email or phone)"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                />
              </div>
            </>
          )}

          <Button type="submit" style={{ width: "100%" }} disabled={loading}>
            {loading
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
              ? "Create Account"
              : "Sign In"}
          </Button>
        </form>

        <div className="login-footer">
          <button
            className="toggle-mode-btn"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setUsername("");
              setEmail("");
              setPhone("");
              setPassword("");
              setConfirmPassword("");
            }}
            type="button"
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>

          <div className="demo-credentials">
            <strong
              style={{
                color: "#1a73e8",
                display: "block",
                marginBottom: "8px",
              }}
            >
              🎮 Demo Credentials:
            </strong>
            <div
              style={{
                background: "#f0f7ff",
                padding: "12px",
                borderRadius: "6px",
                border: "2px solid #1a73e8",
                marginBottom: "12px",
              }}
            >
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                <strong>Username:</strong>{" "}
                <code
                  style={{
                    background: "#fff",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    color: "#1a73e8",
                  }}
                >
                  admin
                </code>
              </p>
              <p style={{ margin: "6px 0", fontSize: "14px" }}>
                <strong>Password:</strong>{" "}
                <code
                  style={{
                    background: "#fff",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    color: "#1a73e8",
                  }}
                >
                  admin123
                </code>
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin");
                  setPassword("admin123");
                  setError("");
                }}
                style={{
                  marginTop: "8px",
                  padding: "6px 12px",
                  background: "#1a73e8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100%",
                }}
              >
                🔐 Auto-Fill Credentials
              </button>
            </div>
            {!isFirebaseConfigured() && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "8px",
                  textAlign: "center",
                }}
              >
                ✓ Demo Mode Active (No Firebase needed)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
