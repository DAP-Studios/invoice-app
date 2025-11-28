export interface InvoiceItem {
  id: string;
  description: string;
  hsn: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: number;
  type: 'INVOICE' | 'QUOTATION';
  invoiceNo: string;
  date: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  customerContact?: string;
  customerPhone?: string;
  customerEmail?: string;
  poNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGST: number;
  totalAmount: number;
  amountInWords?: string;
  status: 'Paid' | 'Pending' | 'Draft';
  timestamp: string;
}

export interface CompanySettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyLogo?: string;
  bankName: string;
  bankAccount: string;
  bankIFSC: string;
  termsAndConditions: string[];
}

export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  thisMonthRevenue: number;
}

export interface Customer {
  id: number;
  name: string;
  address: string;
  contact?: string;
  phone?: string;
  email?: string;
}
