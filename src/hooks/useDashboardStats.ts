import { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { DashboardStats } from "../types";

export const useDashboardStats = (): DashboardStats => {
  const { invoices } = useInvoices();

  return useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Invoices
    const invoiceList = invoices.filter((inv) => inv.type === "INVOICE");
    const totalInvoices = invoiceList.length;
    const totalRevenue = invoiceList
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingInvoices = invoiceList.filter(
      (inv) => inv.status === "Pending"
    ).length;
    const thisMonthRevenue = invoiceList
      .filter((inv) => {
        const d = new Date(inv.timestamp);
        return (
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear &&
          inv.status === "Paid"
        );
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Quotations
    const quotationList = invoices.filter((inv) => inv.type === "QUOTATION");
    const totalQuotations = quotationList.length;
    const totalQuotationValue = quotationList.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    const pendingQuotations = quotationList.filter(
      (inv) => inv.status === "Pending"
    ).length;
    const thisMonthQuotationValue = quotationList
      .filter((inv) => {
        const d = new Date(inv.timestamp);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Purchase Orders
    const poList = invoices.filter((inv) => inv.type === "PURCHASE ORDER");
    const totalPurchaseOrders = poList.length;
    const totalPurchaseOrderValue = poList.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    const pendingPurchaseOrders = poList.filter(
      (inv) => inv.status === "Pending"
    ).length;
    const thisMonthPurchaseOrderValue = poList
      .filter((inv) => {
        const d = new Date(inv.timestamp);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      totalInvoices,
      totalQuotations,
      totalPurchaseOrders,
      totalRevenue,
      totalQuotationValue,
      totalPurchaseOrderValue,
      pendingInvoices,
      pendingQuotations,
      pendingPurchaseOrders,
      thisMonthRevenue,
      thisMonthQuotationValue,
      thisMonthPurchaseOrderValue,
    };
  }, [invoices]);
};
