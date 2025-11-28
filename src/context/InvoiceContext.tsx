import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Invoice, CompanySettings } from "../types";
import {
  loadInvoicesFromFirebase,
  saveInvoiceToFirebase,
  updateInvoiceInFirebase,
  deleteInvoiceFromFirebase,
  loadSettingsFromFirebase,
  saveSettingsToFirebase,
} from "../services/firebaseService";
import {
  loadInvoices,
  saveInvoices,
  loadSettings,
  saveSettings,
} from "../utils/storage";

interface InvoiceContextType {
  invoices: Invoice[];
  settings: CompanySettings | null;
  loading: boolean;
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: number, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  updateSettings: (settings: CompanySettings) => Promise<void>;
}

const defaultSettings: CompanySettings = {
  companyName: "YOUR COMPANY NAME",
  companyAddress: "Set company details in Settings",
  companyPhone: "-",
  companyEmail: "-",
  companyWebsite: "-",
  bankName: "-",
  bankAccount: "-",
  bankIFSC: "-",
  termsAndConditions: [
    "Payment due within 30 days",
    "Goods once sold will not be taken back",
  ],
};

// Check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "your_api_key_here"
  );
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFirebase] = useState(isFirebaseConfigured());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (useFirebase) {
          // Load from Firebase
          const [loadedInvoices, loadedSettings] = await Promise.all([
            loadInvoicesFromFirebase(),
            loadSettingsFromFirebase(),
          ]);
          setInvoices(loadedInvoices);
          setSettings(loadedSettings || defaultSettings);
        } else {
          // Load from localStorage (demo mode)
          const loadedInvoices = loadInvoices();
          const loadedSettings = loadSettings();
          setInvoices(loadedInvoices);
          setSettings(loadedSettings || defaultSettings);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [useFirebase]);

  const addInvoice = async (invoice: Invoice) => {
    try {
      if (useFirebase) {
        await saveInvoiceToFirebase(invoice);
      } else {
        // Demo mode - use localStorage
        const updatedInvoices = [...invoices, invoice];
        saveInvoices(updatedInvoices);
      }
      const updatedInvoices = [...invoices, invoice];
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error("Error adding invoice:", error);
      throw error;
    }
  };

  const updateInvoice = async (id: number, updates: Partial<Invoice>) => {
    try {
      if (useFirebase) {
        await updateInvoiceInFirebase(id, updates);
      } else {
        // Demo mode - use localStorage
        const updatedInvoices = invoices.map((inv) =>
          inv.id === id ? { ...inv, ...updates } : inv
        );
        saveInvoices(updatedInvoices);
      }
      const updatedInvoices = invoices.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      );
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  };

  const deleteInvoice = async (id: number) => {
    try {
      if (useFirebase) {
        await deleteInvoiceFromFirebase(id);
      } else {
        // Demo mode - use localStorage
        const updatedInvoices = invoices.filter((inv) => inv.id !== id);
        saveInvoices(updatedInvoices);
      }
      const updatedInvoices = invoices.filter((inv) => inv.id !== id);
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: CompanySettings) => {
    try {
      if (useFirebase) {
        await saveSettingsToFirebase(newSettings);
      } else {
        // Demo mode - use localStorage
        saveSettings(newSettings);
      }
      setSettings(newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        settings,
        loading,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateSettings,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoices must be used within an InvoiceProvider");
  }
  return context;
};
