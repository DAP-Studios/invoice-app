import { Invoice, InvoiceItem } from '../types';

export const generateInvoiceNumber = (
  invoices: Invoice[],
  type: 'INVOICE' | 'QUOTATION'
): string => {
  const year = new Date().getFullYear();
  const prefix = type === 'QUOTATION' ? 'QUO' : 'INV';
  
  const sameTypeInvoices = invoices.filter(
    (inv) => inv.invoiceNo && inv.invoiceNo.startsWith(`${prefix}-${year}`)
  );
  
  let maxNumber = 0;
  sameTypeInvoices.forEach((inv) => {
    const match = inv.invoiceNo.match(/\d+$/);
    if (match) {
      const num = parseInt(match[0]);
      if (num > maxNumber) maxNumber = num;
    }
  });
  
  const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
  return `${prefix}-${year}-${nextNumber}`;
};

export const calculateItemAmount = (quantity: number, rate: number): number => {
  return quantity * rate;
};

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateTax = (subtotal: number, rate: number): number => {
  return (subtotal * rate) / 100;
};

export const calculateGrandTotal = (
  subtotal: number,
  cgstAmount: number,
  sgstAmount: number
): number => {
  return subtotal + cgstAmount + sgstAmount;
};

export const formatCurrency = (amount: number): string => {
  return `₹ ${amount.toFixed(2)}`;
};

export const formatDate = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const getDueDate = (daysFromNow: number = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return formatDate(date);
};

export const numberToWords = (num: number): string => {
  if (num === 0) return 'ZERO';
  
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  
  const convertHundreds = (n: number): string => {
    let str = '';
    if (n > 99) {
      str += ones[Math.floor(n / 100)] + ' HUNDRED ';
      n %= 100;
    }
    if (n > 19) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      str += teens[n - 10] + ' ';
      return str;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str;
  };
  
  let result = '';
  const crore = Math.floor(num / 10000000);
  if (crore > 0) {
    result += convertHundreds(crore) + 'CRORE ';
    num %= 10000000;
  }
  
  const lakh = Math.floor(num / 100000);
  if (lakh > 0) {
    result += convertHundreds(lakh) + 'LAKH ';
    num %= 100000;
  }
  
  const thousand = Math.floor(num / 1000);
  if (thousand > 0) {
    result += convertHundreds(thousand) + 'THOUSAND ';
    num %= 1000;
  }
  
  if (num > 0) {
    result += convertHundreds(num);
  }
  
  return 'RUPEES ' + result.trim() + ' ONLY';
};
