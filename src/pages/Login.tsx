import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import "./Login.css";

// Check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "your-firebase-api-key-here"
  );
};

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
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

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (isSignup) {
      // Signup validation
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
        const result = await signup(email, password);
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
      // Login
      setLoading(true);
      try {
        const success = await login(email, password);
        if (success) {
          navigate("/app");
        } else {
          setError("Invalid email or password");
        }
      } catch (err) {
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

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              placeholder={
                isSignup ? "At least 6 characters" : "Enter your password"
              }
            />
          </div>

          {isSignup && (
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
              setConfirmPassword("");
            }}
            type="button"
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>

          <div className="demo-credentials">
            <strong>
              {isFirebaseConfigured()
                ? "Demo Credentials:"
                : "🎮 Demo Mode Active"}
            </strong>
            <p>
              👤 Username: <code>admin</code> | Password: <code>admin123</code>
            </p>
            {!isFirebaseConfigured() && (
              <p style={{ fontSize: "11px", color: "#666", marginTop: "8px" }}>
                ℹ️ Running in demo mode (localStorage). Configure Firebase in
                .env for cloud storage.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
