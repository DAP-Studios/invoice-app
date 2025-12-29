import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebase";

interface User {
  username: string;
  email: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials for local development (works without Firebase)
const DEMO_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  email: "admin@company.com",
};

// Check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "your_api_key_here"
  );
};

// Map username to email for Firebase
const getUserEmail = (username: string): string => {
  if (username === "admin") {
    return "admin@company.com";
  }
  return `${username}@company.com`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFirebase] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (useFirebase) {
      // Firebase authentication
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            setUser({
              username: firebaseUser.email?.split("@")[0] || "user",
              email: firebaseUser.email || "",
              uid: firebaseUser.uid,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      // Demo mode - check localStorage
      const savedUser = localStorage.getItem("demo_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, [useFirebase]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    // Demo login mode (works without Firebase)
    if (!useFirebase) {
      // Check default admin credentials
      if (
        username === DEMO_CREDENTIALS.username &&
        password === DEMO_CREDENTIALS.password
      ) {
        const userData: User = {
          username: DEMO_CREDENTIALS.username,
          email: DEMO_CREDENTIALS.email,
          uid: "demo-user-admin",
        };
        setUser(userData);
        localStorage.setItem("demo_user", JSON.stringify(userData));
        return true;
      }

      // Check registered demo users (with password stored - for demo only!)
      const demoUsers = JSON.parse(localStorage.getItem("demo_users") || "[]");
      const matchedUser = demoUsers.find(
        (u: any) => u.username === username && u.password === password
      );

      if (matchedUser) {
        const userData: User = {
          username: matchedUser.username,
          email: matchedUser.email,
          uid: matchedUser.uid,
        };
        setUser(userData);
        localStorage.setItem("demo_user", JSON.stringify(userData));
        return true;
      }

      return false;
    }

    // Firebase login mode
    try {
      const email = getUserEmail(username);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setUser({
        username: username,
        email: userCredential.user.email || email,
        uid: userCredential.user.uid,
      });

      return true;
    } catch (error: any) {
      console.error("Login error:", error.message);
      return false;
    }
  };
  const logout = async (): Promise<void> => {
    if (!useFirebase) {
      // Demo logout
      setUser(null);
      localStorage.removeItem("demo_user");
      return;
    }

    // Firebase logout
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const signup = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Validate username format (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return {
        success: false,
        error:
          "Username must be 3-20 characters (letters, numbers, underscore only)",
      };
    }

    // Demo signup mode (works without Firebase)
    if (!useFirebase) {
      // In demo mode, check if user already exists
      const existingUsers = JSON.parse(
        localStorage.getItem("demo_users") || "[]"
      );
      if (existingUsers.find((u: any) => u.username === username)) {
        return { success: false, error: "Username already exists" };
      }

      // Check if it's the default admin username
      if (username.toLowerCase() === "admin") {
        return { success: false, error: "Username already exists" };
      }

      // Check password strength for demo mode
      if (password.length < 6) {
        return {
          success: false,
          error: "Password should be at least 6 characters",
        };
      }

      // Create new demo user (storing password for demo only - don't do this in production!)
      const userData = {
        username: username,
        email: `${username}@daptech.com`,
        uid: "demo-user-" + Date.now(),
        password: password, // Only for demo mode
      };

      // Save to demo users list
      existingUsers.push(userData);
      localStorage.setItem("demo_users", JSON.stringify(existingUsers));

      // Login the user
      const userForState: User = {
        username: userData.username,
        email: userData.email,
        uid: userData.uid,
      };
      setUser(userForState);
      localStorage.setItem("demo_user", JSON.stringify(userForState));

      return { success: true };
    }

    // Firebase signup mode
    try {
      const email = getUserEmail(username);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      setUser({
        username: username,
        email: userCredential.user.email || email,
        uid: userCredential.user.uid,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Signup error:", error.message);

      let errorMessage = "Signup failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Username already exists";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid username format";
      }

      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// add a stable function export for the hook to fix HMR fast refresh incompatibility
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
