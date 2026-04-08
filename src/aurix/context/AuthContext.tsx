import { createContext, useContext, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { BusinessProfile } from "../types";

type SessionState = {
  access_token: string;
  user: { id: string; email?: string };
  business?: BusinessProfile | null;
};

type SignupInput = {
  email: string;
  password: string;
} & BusinessProfile;

type AuthContextValue = {
  session: SessionState | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupInput) => Promise<void>;
  enterTestMode: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "aurix_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionState) : null;
  });

  async function login(email: string, password: string) {
    const data = await apiFetch<{
      session: { access_token: string };
      user: { id: string; email?: string };
      business?: BusinessProfile;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const nextSession: SessionState = {
      access_token: data.session.access_token,
      user: data.user,
      business: data.business || null,
    };

    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }

  async function signup(payload: SignupInput) {
    const data = await apiFetch<{
      session?: { access_token: string };
      user: { id: string; email?: string };
    }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data.session) {
      const nextSession: SessionState = {
        access_token: data.session.access_token,
        user: data.user,
        business: {
          business_name: payload.business_name,
          gstin: payload.gstin,
          address: payload.address,
          phone: payload.phone,
          logo: payload.logo,
        },
      };
      setSession(nextSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    }
  }

  function enterTestMode() {
    const nextSession: SessionState = {
      access_token: "test-mode",
      user: { id: "test-user", email: "testmode@aurix.local" },
      business: {
        business_name: "Aurix Test Business",
        gstin: "22AAAAA0000A1Z5",
        address: "Demo Address, Bengaluru",
        phone: "+91 90000 00000",
        logo: "",
      },
    };

    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }

  function logout() {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({ session, login, signup, enterTestMode, logout }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

export function isTestModeSession(token?: string | null) {
  return token === "test-mode";
}
