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

export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(getInvoicesKey(), JSON.stringify(invoices));
};

export const loadInvoices = (): Invoice[] => {
  const data = localStorage.getItem(getInvoicesKey());
  return data ? JSON.parse(data) : [];
};

export const saveSettings = (settings: CompanySettings): void => {
  localStorage.setItem(getSettingsKey(), JSON.stringify(settings));
};

export const loadSettings = (): CompanySettings | null => {
  const data = localStorage.getItem(getSettingsKey());
  return data ? JSON.parse(data) : null;
};

export const saveLogo = (logoDataUrl: string): void => {
  localStorage.setItem(getLogoKey(), logoDataUrl);
};

export const loadLogo = (): string | null => {
  return localStorage.getItem(getLogoKey());
};

export const clearAllData = (): void => {
  localStorage.clear();
};
