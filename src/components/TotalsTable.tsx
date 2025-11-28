import React from 'react';
import { formatCurrency } from '../utils/invoiceUtils';
import './TotalsTable.css';

interface TotalsTableProps {
  subtotal: number;
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGST: number;
  totalAmount: number;
  onCGSTRateChange: (rate: number) => void;
  onSGSTRateChange: (rate: number) => void;
}

export const TotalsTable: React.FC<TotalsTableProps> = ({
  subtotal,
  cgstRate,
  sgstRate,
  cgstAmount,
  sgstAmount,
  totalGST,
  totalAmount,
  onCGSTRateChange,
  onSGSTRateChange
}) => {
  return (
    <table className="total-table">
      <tbody>
        <tr className="subtotal-row">
          <td className="label-cell">SUBTOTAL</td>
          <td className="amount-cell">{formatCurrency(subtotal)}</td>
        </tr>
        <tr className="tax-row">
          <td className="label-cell">
            CGST @{' '}
            <input
              type="number"
              value={cgstRate}
              onChange={(e) => onCGSTRateChange(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.1"
              className="tax-input"
            />
            %
          </td>
          <td className="amount-cell">{formatCurrency(cgstAmount)}</td>
        </tr>
        <tr className="tax-row">
          <td className="label-cell">
            SGST @{' '}
            <input
              type="number"
              value={sgstRate}
              onChange={(e) => onSGSTRateChange(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.1"
              className="tax-input"
            />
            %
          </td>
          <td className="amount-cell">{formatCurrency(sgstAmount)}</td>
        </tr>
        <tr className="total-gst-row">
          <td className="label-cell">TOTAL GST</td>
          <td className="amount-cell">{formatCurrency(totalGST)}</td>
        </tr>
        <tr className="grand-total-row">
          <td className="label-cell">GRAND TOTAL</td>
          <td className="amount-cell">{formatCurrency(totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  );
};
