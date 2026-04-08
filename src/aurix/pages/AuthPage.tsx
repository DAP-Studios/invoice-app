import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { login, signup, enterTestMode } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      if (isSignup) {
        await signup({
          email: String(formData.get("email")),
          password: String(formData.get("password")),
          business_name: String(formData.get("business_name")),
          gstin: String(formData.get("gstin")),
          address: String(formData.get("address")),
          phone: String(formData.get("phone")),
          logo: String(formData.get("logo") || ""),
        });
      } else {
        await login(
          String(formData.get("email")),
          String(formData.get("password")),
        );
      }

      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#cffafe,_#f8fafc_40%)] p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border bg-white p-5 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-extrabold">Aurix Smart Invoice</h1>
          <p className="text-sm text-slate-500">
            {isSignup ? "Create business account" : "Login to continue"}
          </p>
        </div>

        {error ? (
          <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-lg border p-3 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password"
          className="w-full rounded-lg border p-3 text-sm"
        />

        {isSignup ? (
          <>
            <input
              name="business_name"
              required
              placeholder="Business name"
              className="w-full rounded-lg border p-3 text-sm"
            />
            <input
              name="gstin"
              required
              placeholder="GSTIN"
              className="w-full rounded-lg border p-3 text-sm"
            />
            <textarea
              name="address"
              required
              placeholder="Business address"
              className="w-full rounded-lg border p-3 text-sm"
            />
            <input
              name="phone"
              required
              placeholder="Phone"
              className="w-full rounded-lg border p-3 text-sm"
            />
            <input
              name="logo"
              placeholder="Logo URL (optional)"
              className="w-full rounded-lg border p-3 text-sm"
            />
          </>
        ) : null}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-cyan-600 p-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : isSignup ? "Create account" : "Login"}
        </button>

        <button
          type="button"
          onClick={() => setIsSignup((v) => !v)}
          className="w-full text-sm text-slate-600 underline"
        >
          {isSignup
            ? "Already have an account? Login"
            : "New business? Create account"}
        </button>

        <button
          type="button"
          onClick={() => {
            enterTestMode();
            navigate("/explore");
          }}
          className="w-full rounded-lg border border-cyan-300 bg-cyan-50 p-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
        >
          Try Test Mode (Skip Login)
        </button>
      </form>
    </div>
  );
}
