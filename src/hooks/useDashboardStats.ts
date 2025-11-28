import { useMemo } from 'react';
import { useInvoices } from '../context/InvoiceContext';
import { DashboardStats } from '../types';

export const useDashboardStats = (): DashboardStats => {
  const { invoices } = useInvoices();

  return useMemo(() => {
    const totalInvoices = invoices.length;
    
    const totalRevenue = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.timestamp);
        return invDate.getMonth() === currentMonth && 
               invDate.getFullYear() === currentYear &&
               inv.status === 'Paid';
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      totalInvoices,
      totalRevenue,
      pendingInvoices,
      thisMonthRevenue
    };
  }, [invoices]);
};
