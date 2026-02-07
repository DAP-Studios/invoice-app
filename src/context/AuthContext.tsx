import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface CustomStorage {
  get(key: string): Promise<{ value: string } | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

declare global {
  interface Window {
    storage: CustomStorage;
  }
}

interface User {
  username: string;
  email: string;
  phone: string;
  uid: string;
  hasPin: boolean;
}

interface StoredUser {
  username: string;
  email: string;
  phone: string;
  password: string;
  pin?: string;
  uid: string;
}

// Demo admin account
const DEMO_ADMIN: StoredUser = {
  username: "admin",
  email: "admin@invoiceapp.com",
  phone: "+1234567890",
  password: "admin123",
  uid: "admin-uid-001",
};

// Storage helper
const storage = {
  getItem: async (key: string) => {
    const result = await window.storage?.get(key);
    return result?.value || null;
  },
  setItem: async (key: string, value: string) => {
    await window.storage?.set(key, value);
  },
  removeItem: async (key: string) => {
    await window.storage?.delete(key);
  },
};

export interface AuthContextType {
  user: User | null;
  login: (
    credential: string,
    password: string,
  ) => Promise<{ success: boolean; needsPin?: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  loginWithPin: (
    credential: string,
    pin: string,
  ) => Promise<{ success: boolean; error?: string }>;
  setupPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    username: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load current user session on mount
  useEffect(() => {
    const loadSession = async () => {
      const savedUser = await storage.getItem("current_user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error("Failed to parse user session:", error);
        }
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  // Get all registered users
  const getAllUsers = async (): Promise<StoredUser[]> => {
    const usersJson = await storage.getItem("registered_users");
    return usersJson ? JSON.parse(usersJson) : [];
  };

  // Save all users
  const saveAllUsers = async (users: StoredUser[]): Promise<void> => {
    await storage.setItem("registered_users", JSON.stringify(users));
  };

  // Find user by credential (username, email, or phone)
  const findUserByCredential = async (
    credential: string,
  ): Promise<StoredUser | null> => {
    const trimmed = credential.trim().toLowerCase();

    // Check admin account first
    if (
      trimmed === DEMO_ADMIN.username.toLowerCase() ||
      trimmed === DEMO_ADMIN.email.toLowerCase() ||
      trimmed === DEMO_ADMIN.phone.toLowerCase()
    ) {
      return DEMO_ADMIN;
    }

    // Check registered users
    const users = await getAllUsers();
    return (
      users.find(
        (u) =>
          u.username.toLowerCase() === trimmed ||
          u.email.toLowerCase() === trimmed ||
          u.phone.toLowerCase() === trimmed,
      ) || null
    );
  };

  // Regular login with password
  const login = async (
    credential: string,
    password: string,
  ): Promise<{ success: boolean; needsPin?: boolean; error?: string }> => {
    const trimmedCredential = credential.trim();
    const trimmedPassword = password.trim();

    if (!trimmedCredential || !trimmedPassword) {
      return { success: false, error: "Please enter all fields" };
    }

    console.log("🔐 Login attempt:", trimmedCredential);

    const foundUser = await findUserByCredential(trimmedCredential);

    if (!foundUser) {
      return { success: false, error: "User not found" };
    }

    if (foundUser.password !== trimmedPassword) {
      return { success: false, error: "Invalid password" };
    }

    // Successful login
    const userData: User = {
      username: foundUser.username,
      email: foundUser.email,
      phone: foundUser.phone,
      uid: foundUser.uid,
      hasPin: !!foundUser.pin,
    };

    setUser(userData);
    await storage.setItem("current_user", JSON.stringify(userData));

    console.log("✅ Login successful");

    return {
      success: true,
      needsPin: !foundUser.pin, // Suggest PIN setup if user doesn't have one
    };
  };

  // Login with PIN (fast login)
  const loginWithPin = async (
    credential: string,
    pin: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedCredential = credential.trim();
    const trimmedPin = pin.trim();

    if (!trimmedCredential || !trimmedPin) {
      return { success: false, error: "Please enter all fields" };
    }

    if (trimmedPin.length !== 4 && trimmedPin.length !== 6) {
      return { success: false, error: "PIN must be 4 or 6 digits" };
    }

    console.log("🔢 PIN login attempt:", trimmedCredential);

    const foundUser = await findUserByCredential(trimmedCredential);

    if (!foundUser) {
      return { success: false, error: "User not found" };
    }

    if (!foundUser.pin) {
      return {
        success: false,
        error: "PIN not set up. Please login with password first.",
      };
    }

    if (foundUser.pin !== trimmedPin) {
      return { success: false, error: "Invalid PIN" };
    }

    // Successful PIN login
    const userData: User = {
      username: foundUser.username,
      email: foundUser.email,
      phone: foundUser.phone,
      uid: foundUser.uid,
      hasPin: true,
    };

    setUser(userData);
    await storage.setItem("current_user", JSON.stringify(userData));

    console.log("✅ PIN login successful");
    return { success: true };
  };

  // Setup or update PIN
  const setupPin = async (
    pin: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "No user logged in" };
    }

    const trimmedPin = pin.trim();

    // Validate PIN
    if (!/^\d{4}$/.test(trimmedPin) && !/^\d{6}$/.test(trimmedPin)) {
      return {
        success: false,
        error: "PIN must be 4 or 6 digits",
      };
    }

    console.log("📌 Setting up PIN for:", user.username);

    // Update user in storage
    const users = await getAllUsers();
    const userIndex = users.findIndex((u) => u.uid === user.uid);

    if (userIndex !== -1) {
      users[userIndex].pin = trimmedPin;
      await saveAllUsers(users);
    } else if (user.uid === DEMO_ADMIN.uid) {
      // Can't modify demo admin in storage, but we can update session
      console.log("Note: Demo admin PIN only valid for current session");
    }

    // Update current user session
    const updatedUser = { ...user, hasPin: true };
    setUser(updatedUser);
    await storage.setItem("current_user", JSON.stringify(updatedUser));

    console.log("✅ PIN setup successful");
    return { success: true };
  };

  // Signup new user
  const signup = async (data: {
    username: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const { username, email, phone, password } = data;

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return {
        success: false,
        error: "Username: 3-20 chars (letters, numbers, underscore only)",
      };
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" };
    }

    // Validate phone
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return { success: false, error: "Invalid phone number" };
    }

    // Validate password
    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    console.log("📝 Signup attempt:", username);

    // Check if username is reserved
    if (username.toLowerCase() === "admin") {
      return { success: false, error: "Username already taken" };
    }

    // Get existing users
    const existingUsers = await getAllUsers();

    // Check for duplicates
    if (
      existingUsers.find(
        (u) => u.username.toLowerCase() === username.toLowerCase(),
      )
    ) {
      return { success: false, error: "Username already taken" };
    }

    if (
      existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
    ) {
      return { success: false, error: "Email already registered" };
    }

    if (existingUsers.find((u) => u.phone === phone)) {
      return { success: false, error: "Phone number already registered" };
    }

    // Create new user
    const newUser: StoredUser = {
      username,
      email,
      phone,
      password,
      uid: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Save user
    existingUsers.push(newUser);
    await saveAllUsers(existingUsers);

    // Auto-login the user
    const userData: User = {
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      uid: newUser.uid,
      hasPin: false,
    };

    setUser(userData);
    await storage.setItem("current_user", JSON.stringify(userData));

    console.log("✅ Signup successful");
    return { success: true };
  };

  // Logout
  const logout = async (): Promise<void> => {
    setUser(null);
    await storage.removeItem("current_user");
    console.log("👋 Logged out");
  };

  // Logout from all devices
  const logoutEverywhere = async () => {
    try {
      // Call API to invalidate all sessions
      await fetch("/api/auth/logout-everywhere", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // Clear local state
      setUser(null);
      localStorage.removeItem("authToken");
      sessionStorage.clear();
    } catch (error) {
      console.error("Logout everywhere failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        logoutEverywhere,
        loginWithPin,
        setupPin,
        signup,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
