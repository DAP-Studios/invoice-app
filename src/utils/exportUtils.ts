import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Papa from "papaparse";
import { Invoice } from "../types";
import { formatCurrency } from "./invoiceUtils";

// PDF Export - Full Invoice
export const exportInvoicePDF = async (
  invoiceNumber: string
): Promise<void> => {
  try {
    const element = document.getElementById("invoice-content");
    if (!element) {
      alert("Invoice content not found");
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${invoiceNumber}.pdf`);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
};

// CSV Export - Multiple Invoices
export const exportInvoicesCSV = (invoices: Invoice[]): void => {
  try {
    const csvData = invoices.map((invoice) => ({
      "Invoice #": invoice.invoiceNo,
      Type: invoice.type,
      Date: invoice.date,
      "Due Date": invoice.dueDate,
      Customer: invoice.customerName,
      "Customer Email": invoice.customerEmail || "-",
      "Customer Phone": invoice.customerPhone || "-",
      Subtotal: invoice.subtotal.toFixed(2),
      "CGST (%)": invoice.cgstRate,
      "SGST (%)": invoice.sgstRate,
      "Total GST": invoice.totalGST.toFixed(2),
      "Total Amount": invoice.totalAmount.toFixed(2),
      Status: invoice.status,
      "Items Count": invoice.items.length,
      "Created On": invoice.timestamp,
    }));

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, "invoices.csv");
  } catch (error) {
    console.error("Error exporting CSV:", error);
    alert("Failed to export CSV. Please try again.");
  }
};

// CSV Export - Detailed Items
export const exportInvoiceItemsCSV = (invoice: Invoice): void => {
  try {
    const itemsData = invoice.items.map((item) => ({
      "Invoice #": invoice.invoiceNo,
      Description: item.description,
      HSN: item.hsn,
      Unit: item.unit,
      Quantity: item.quantity,
      Rate: item.rate.toFixed(2),
      Amount: item.amount.toFixed(2),
      Customer: invoice.customerName,
      Date: invoice.date,
    }));

    const csv = Papa.unparse(itemsData);
    downloadCSV(csv, `items-${invoice.invoiceNo}.csv`);
  } catch (error) {
    console.error("Error exporting items CSV:", error);
    alert("Failed to export items CSV. Please try again.");
  }
};

// CSV Export - Payments Report
export const exportPaymentsCSV = (invoices: Invoice[]): void => {
  try {
    const paymentsData = invoices
      .filter((inv) => inv.status === "Pending" || inv.status === "Paid")
      .map((invoice) => ({
        "Invoice #": invoice.invoiceNo,
        Type: invoice.type,
        Customer: invoice.customerName,
        "Due Date": invoice.dueDate,
        "Amount Due": invoice.totalAmount.toFixed(2),
        Status: invoice.status,
        "Days Overdue": calculateDaysOverdue(invoice.dueDate),
        Email: invoice.customerEmail || "-",
      }));

    const csv = Papa.unparse(paymentsData);
    downloadCSV(csv, "payments-report.csv");
  } catch (error) {
    console.error("Error exporting payments CSV:", error);
    alert("Failed to export payments. Please try again.");
  }
};

// Helper function to download CSV
const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Calculate days overdue
const calculateDaysOverdue = (dueDate: string): number => {
  const due = new Date(dueDate.split("-").reverse().join("-"));
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Email invoice (opens mailto)
export const emailInvoice = (
  invoice: Invoice,
  recipientEmail?: string
): void => {
  const email = recipientEmail || invoice.customerEmail || "";
  if (!email) {
    alert("No email address found for this customer");
    return;
  }

  const subject = `Invoice ${invoice.invoiceNo}`;
  const body = `Dear ${invoice.customerName},\n\nPlease find attached invoice ${
    invoice.invoiceNo
  } dated ${invoice.date}.\n\nTotal Amount: ${formatCurrency(
    invoice.totalAmount
  )}\nDue Date: ${invoice.dueDate}\n\nThank you!`;

  window.location.href = `mailto:${email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
};

// Generate Excel-like CSV with formatting (advanced)
export const exportInvoiceSummaryCSV = (invoices: Invoice[]): void => {
  try {
    const summaryData: Record<string, string | number>[] = [];

    // Summary Section
    summaryData.push({ "INVOICE SUMMARY": "" });
    summaryData.push({ "Total Invoices": invoices.length });
    summaryData.push({
      "Total Revenue": invoices
        .filter((inv) => inv.status === "Paid")
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
        .toFixed(2),
    });
    summaryData.push({
      "Pending Amount": invoices
        .filter((inv) => inv.status === "Pending")
        .reduce((sum, inv) => sum + inv.totalAmount, 0)
        .toFixed(2),
    });
    summaryData.push({ "": "" });

    // Detailed list
    const csvData = invoices.map((invoice) => ({
      "Invoice #": invoice.invoiceNo,
      Type: invoice.type,
      Date: invoice.date,
      Customer: invoice.customerName,
      "Total Amount": invoice.totalAmount.toFixed(2),
      Status: invoice.status,
    }));

    const allData = [...summaryData, ...csvData];

    const csv = Papa.unparse(allData);
    downloadCSV(csv, "invoice-summary.csv");
  } catch (error) {
    console.error("Error exporting summary CSV:", error);
    alert("Failed to export summary. Please try again.");
  }
};
