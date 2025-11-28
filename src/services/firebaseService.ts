import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { Invoice, CompanySettings } from "../types";

// Collection names
const INVOICES_COLLECTION = "invoices";
const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOC_ID = "company_settings";

// ==================== INVOICES ====================

export const saveInvoiceToFirebase = async (
  invoice: Invoice
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
      ...invoice,
      timestamp: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving invoice:", error);
    throw error;
  }
};

export const loadInvoicesFromFirebase = async (): Promise<Invoice[]> => {
  try {
    const q = query(
      collection(db, INVOICES_COLLECTION),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.data().id || parseInt(doc.id), // Keep original ID or use doc ID
      timestamp:
        doc.data().timestamp?.toDate().toISOString() ||
        new Date().toISOString(),
    })) as Invoice[];
  } catch (error) {
    console.error("Error loading invoices:", error);
    return [];
  }
};

export const updateInvoiceInFirebase = async (
  id: number,
  updates: Partial<Invoice>
): Promise<void> => {
  try {
    // Find document by invoice ID field
    const q = query(collection(db, INVOICES_COLLECTION));
    const querySnapshot = await getDocs(q);

    const invoiceDoc = querySnapshot.docs.find((doc) => doc.data().id === id);

    if (invoiceDoc) {
      await updateDoc(doc(db, INVOICES_COLLECTION, invoiceDoc.id), updates);
    } else {
      console.error("Invoice not found:", id);
    }
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

export const deleteInvoiceFromFirebase = async (id: number): Promise<void> => {
  try {
    // Find document by invoice ID field
    const q = query(collection(db, INVOICES_COLLECTION));
    const querySnapshot = await getDocs(q);

    const invoiceDoc = querySnapshot.docs.find((doc) => doc.data().id === id);

    if (invoiceDoc) {
      await deleteDoc(doc(db, INVOICES_COLLECTION, invoiceDoc.id));
    } else {
      console.error("Invoice not found:", id);
    }
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

// ==================== SETTINGS ====================

export const saveSettingsToFirebase = async (
  settings: CompanySettings
): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await updateDoc(settingsRef, settings as Record<string, any>).catch(
      async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, SETTINGS_COLLECTION), {
          ...settings,
          id: SETTINGS_DOC_ID,
        });
      }
    );
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
};

export const loadSettingsFromFirebase =
  async (): Promise<CompanySettings | null> => {
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        return docSnap.data() as CompanySettings;
      }

      // Fallback: try to get first document
      const querySnapshot = await getDocs(collection(db, SETTINGS_COLLECTION));
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as CompanySettings;
      }

      return null;
    } catch (error) {
      console.error("Error loading settings:", error);
      return null;
    }
  };

// ==================== LOGO (Storage) ====================

export const saveLogoToFirebase = async (
  logoDataUrl: string
): Promise<string> => {
  try {
    const logoRef = ref(storage, "company/logo.png");
    await uploadString(logoRef, logoDataUrl, "data_url");
    const downloadURL = await getDownloadURL(logoRef);
    return downloadURL;
  } catch (error) {
    console.error("Error saving logo:", error);
    throw error;
  }
};

export const loadLogoFromFirebase = async (): Promise<string | null> => {
  try {
    const logoRef = ref(storage, "company/logo.png");
    const downloadURL = await getDownloadURL(logoRef);
    return downloadURL;
  } catch (error) {
    // Logo doesn't exist yet
    return null;
  }
};
