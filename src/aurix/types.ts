export type LayoutType = "minimal" | "modern-card" | "classic-gst";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  hsn_code?: string;
  image_url?: string;
};

export type InvoiceItem = {
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  image_url?: string;
  hsn_code?: string;
  category?: string;
  line_subtotal?: number;
  line_tax?: number;
  line_total?: number;
};

export type Invoice = {
  id: string;
  invoice_number: number;
  date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  place_of_supply: string;
  is_inter_state: boolean;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
  total_amount: number;
  notes?: string;
  invoice_items: InvoiceItem[];
};

export type BusinessProfile = {
  business_name: string;
  gstin: string;
  address: string;
  phone: string;
  logo?: string;
};

export type TemplateConfig = {
  colors: {
    primary: string;
    accent: string;
    text: string;
    background: string;
  };
  fontFamily: string;
  logoPosition: "left" | "center" | "right";
  sectionOrder: string[];
  showProductImages: boolean;
  showQrCode: boolean;
  showSuggestions: boolean;
};

export type InvoiceTemplate = {
  id: string;
  name: string;
  layout: LayoutType;
  config: TemplateConfig;
  is_active: boolean;
};

export type AnalyticsSummary = {
  totalInvoices: number;
  topProducts: Array<{ name: string; qty: number }>;
  repeatCustomers: number;
  conversionRate: number;
  invoiceViews: number;
  reorderClicks: number;
};
