import { AnalyticsSummary, Invoice, InvoiceTemplate, Product } from "../types";
import { defaultTemplateConfig } from "./defaults";

const PRODUCTS_KEY = "aurix_test_products";
const INVOICES_KEY = "aurix_test_invoices";
const TEMPLATE_KEY = "aurix_test_template";

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getTestProducts(): Product[] {
  return readJson<Product[]>(PRODUCTS_KEY, [
    {
      id: "p-demo-1",
      name: "Steel Rod 10mm",
      price: 120,
      category: "Raw Material",
      hsn_code: "7214",
      image_url: "",
    },
    {
      id: "p-demo-2",
      name: "Industrial Valve",
      price: 450,
      category: "Hardware",
      hsn_code: "8481",
      image_url: "",
    },
  ]);
}

export function saveTestProducts(products: Product[]) {
  writeJson(PRODUCTS_KEY, products);
}

export function addTestProduct(product: Omit<Product, "id">): Product {
  const products = getTestProducts();
  const created: Product = {
    ...product,
    id: `p-${Date.now()}`,
  };
  const next = [created, ...products];
  saveTestProducts(next);
  return created;
}

export function deleteTestProduct(productId: string) {
  const products = getTestProducts().filter((item) => item.id !== productId);
  saveTestProducts(products);
}

export function getTestTemplate(): InvoiceTemplate | null {
  return readJson<InvoiceTemplate | null>(TEMPLATE_KEY, null);
}

export function saveTestTemplate(
  payload: Omit<InvoiceTemplate, "id"> & { id?: string },
): InvoiceTemplate {
  const next: InvoiceTemplate = {
    ...payload,
    id: payload.id || "tpl-test-1",
  };
  writeJson(TEMPLATE_KEY, next);
  return next;
}

export function getTestInvoices(): Invoice[] {
  return readJson<Invoice[]>(INVOICES_KEY, []);
}

export function getTestInvoiceById(id: string): Invoice | null {
  const invoice = getTestInvoices().find((item) => item.id === id);
  return invoice || null;
}

export function createTestInvoice(payload: {
  date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  place_of_supply: string;
  is_inter_state: boolean;
  notes?: string;
  items: Array<{
    product_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    image_url?: string;
    hsn_code?: string;
    category?: string;
  }>;
}): Invoice {
  const invoices = getTestInvoices();
  const invoiceNumber =
    invoices.length > 0
      ? Math.max(...invoices.map((item) => item.invoice_number || 0)) + 1
      : 1;

  const items = payload.items.map((item) => {
    const lineSubtotal = round2(item.quantity * item.unit_price);
    const lineTax = round2((lineSubtotal * item.tax_rate) / 100);
    return {
      ...item,
      line_subtotal: lineSubtotal,
      line_tax: lineTax,
      line_total: round2(lineSubtotal + lineTax),
    };
  });

  const subtotal = round2(
    items.reduce((sum, item) => sum + (item.line_subtotal || 0), 0),
  );
  const totalTax = round2(
    items.reduce((sum, item) => sum + (item.line_tax || 0), 0),
  );
  const cgst = payload.is_inter_state ? 0 : round2(totalTax / 2);
  const sgst = payload.is_inter_state ? 0 : round2(totalTax / 2);
  const igst = payload.is_inter_state ? totalTax : 0;

  const created: Invoice = {
    id: `inv-${Date.now()}`,
    invoice_number: invoiceNumber,
    date: payload.date,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    customer_email: payload.customer_email || "",
    customer_address: payload.customer_address || "",
    place_of_supply: payload.place_of_supply,
    is_inter_state: payload.is_inter_state,
    subtotal,
    cgst,
    sgst,
    igst,
    total_tax: totalTax,
    total_amount: round2(subtotal + totalTax),
    notes: payload.notes || "",
    invoice_items: items,
  };

  writeJson(INVOICES_KEY, [created, ...invoices]);
  return created;
}

export function getTestAnalyticsSummary(): AnalyticsSummary {
  const invoices = getTestInvoices();
  const productMap = new Map<string, number>();

  for (const invoice of invoices) {
    for (const item of invoice.invoice_items) {
      productMap.set(
        item.product_name,
        (productMap.get(item.product_name) || 0) + Number(item.quantity || 0),
      );
    }
  }

  const topProducts = [...productMap.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const customerCount = new Map<string, number>();
  for (const invoice of invoices) {
    customerCount.set(
      invoice.customer_phone,
      (customerCount.get(invoice.customer_phone) || 0) + 1,
    );
  }

  const repeatCustomers = [...customerCount.values()].filter(
    (count) => count > 1,
  ).length;

  return {
    totalInvoices: invoices.length,
    topProducts,
    repeatCustomers,
    conversionRate: 0,
    invoiceViews: 0,
    reorderClicks: 0,
  };
}

export function getTestBusiness() {
  return {
    business_name: "Aurix Test Business",
    gstin: "22AAAAA0000A1Z5",
    address: "Demo Address, Bengaluru",
    phone: "+91 90000 00000",
    logo: "",
  };
}

export function getEffectiveTemplate(): InvoiceTemplate {
  return (
    getTestTemplate() || {
      id: "tpl-test-1",
      name: "Test Template",
      layout: "modern-card",
      config: defaultTemplateConfig,
      is_active: true,
    }
  );
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}
