import { Invoice, CompanySettings } from "../types";

// Get current user ID from localStorage
const getCurrentUserId = (): string => {
  const user = localStorage.getItem("demo_user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.uid || "default";
  }
  return "default";
};

// Check if using temporary demo storage
const isDemoMode = (): boolean => {
  return localStorage.getItem("demo_mode") === "true";
};

const getInvoicesKey = (): string => {
  const userId = getCurrentUserId();
  return `invoices_${userId}`;
};

const getSettingsKey = (): string => {
  const userId = getCurrentUserId();
  return `settings_${userId}`;
};

const getLogoKey = (): string => {
  const userId = getCurrentUserId();
  return `companyLogo_${userId}`;
};

const getTempSettingsKey = (): string => {
  const userId = getCurrentUserId();
  return `temp_settings_${userId}`;
};

const getTempLogoKey = (): string => {
  const userId = getCurrentUserId();
  return `temp_companyLogo_${userId}`;
};

export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(getInvoicesKey(), JSON.stringify(invoices));
};

export const loadInvoices = (): Invoice[] => {
  const data = localStorage.getItem(getInvoicesKey());
  return data ? JSON.parse(data) : [];
};

export const saveSettings = (settings: CompanySettings): void => {
  const key = isDemoMode() ? getTempSettingsKey() : getSettingsKey();
  const storage = isDemoMode() ? sessionStorage : localStorage;
  console.log("[storage.ts] saveSettings called");
  console.log("[storage.ts] isDemoMode:", isDemoMode());
  console.log("[storage.ts] Storage key:", key);
  console.log("[storage.ts] Settings to save:", settings);

  storage.setItem(key, JSON.stringify(settings));
  console.log("[storage.ts] Settings saved successfully");

  // Verify save
  const saved = storage.getItem(key);
  console.log("[storage.ts] Verification - saved data:", saved);
};

export const loadSettings = (): CompanySettings | null => {
  console.log("[storage.ts] loadSettings called");
  console.log("[storage.ts] isDemoMode:", isDemoMode());

  // Check temp storage first (demo mode)
  const tempKey = getTempSettingsKey();
  const tempData = sessionStorage.getItem(tempKey);
  console.log("[storage.ts] Temp key:", tempKey);
  console.log("[storage.ts] Temp data:", tempData);

  if (tempData) {
    const parsed = JSON.parse(tempData);
    console.log("[storage.ts] Returning temp settings:", parsed);
    return parsed;
  }

  // Fall back to persistent storage
  const persistKey = getSettingsKey();
  const data = localStorage.getItem(persistKey);
  console.log("[storage.ts] Persistent key:", persistKey);
  console.log("[storage.ts] Persistent data:", data);

  const result = data ? JSON.parse(data) : null;
  console.log("[storage.ts] Returning persistent settings:", result);
  return result;
};

export const saveLogo = (logoDataUrl: string): void => {
  if (isDemoMode()) {
    // Use temporary sessionStorage for demo mode
    sessionStorage.setItem(getTempLogoKey(), logoDataUrl);
  } else {
    // Use persistent localStorage for normal mode
    localStorage.setItem(getLogoKey(), logoDataUrl);
  }
};

export const loadLogo = (): string | null => {
  // Check temp storage first (demo mode)
  const tempLogo = sessionStorage.getItem(getTempLogoKey());
  if (tempLogo) {
    return tempLogo;
  }

  // Fall back to persistent storage
  return localStorage.getItem(getLogoKey());
};

export const clearAllData = (): void => {
  localStorage.clear();
  sessionStorage.clear();
};

export const clearTempDemoData = (): void => {
  // Clear only temporary demo storage
  sessionStorage.removeItem(getTempSettingsKey());
  sessionStorage.removeItem(getTempLogoKey());
};

export const enableDemoMode = (): void => {
  localStorage.setItem("demo_mode", "true");
};

export const disableDemoMode = (): void => {
  localStorage.removeItem("demo_mode");
  clearTempDemoData();
};
