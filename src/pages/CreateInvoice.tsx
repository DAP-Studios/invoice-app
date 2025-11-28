import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../context/InvoiceContext';
import { Button } from '../components/Button';
import { ItemsTable } from '../components/ItemsTable';
import { TotalsTable } from '../components/TotalsTable';
import { Invoice, InvoiceItem } from '../types';
import {
  generateInvoiceNumber,
  calculateSubtotal,
  calculateTax,
  calculateGrandTotal,
  getTodayDate,
  getDueDate,
  numberToWords,
  formatCurrency
} from '../utils/invoiceUtils';
import { loadLogo } from '../utils/storage';
import './CreateInvoice.css';

export const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, settings, addInvoice } = useInvoices();
  
  const [docType, setDocType] = useState<'INVOICE' | 'QUOTATION'>('INVOICE');
  const [customerName, setCustomerName] = useState('Customer Name');
  const [customerAddress, setCustomerAddress] = useState('Customer Address');
  const [customerContact, setCustomerContact] = useState('Person Name');
  const [customerPhone, setCustomerPhone] = useState('+91 00000 00000');
  const [customerEmail, setCustomerEmail] = useState('customer@email.com');
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());
  const [dueDate, setDueDate] = useState(getDueDate());
  const [poNumber, setPoNumber] = useState('');
  
  const [items, setItems] = useState<InvoiceItem[]>([{
    id: '1',
    description: 'Product/Service Description',
    hsn: 'HSN001',
    unit: 'Pcs',
    quantity: 1,
    rate: 1000,
    amount: 1000
  }]);
  
  const [cgstRate, setCgstRate] = useState(9);
  const [sgstRate, setSgstRate] = useState(9);
  
  const subtotal = calculateSubtotal(items);
  const cgstAmount = calculateTax(subtotal, cgstRate);
  const sgstAmount = calculateTax(subtotal, sgstRate);
  const totalGST = cgstAmount + sgstAmount;
  const totalAmount = calculateGrandTotal(subtotal, cgstAmount, sgstAmount);
  
  const invoiceNumber = generateInvoiceNumber(invoices, docType);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadedLogo = loadLogo();
    setLogo(loadedLogo);
  }, []);

  const handleSave = () => {
    const invoice: Invoice = {
      id: Date.now(),
      type: docType,
      invoiceNo: invoiceNumber,
      date: invoiceDate,
      dueDate: dueDate,
      customerName,
      customerAddress,
      customerContact,
      customerPhone,
      customerEmail,
      poNumber,
      items,
      subtotal,
      cgstRate,
      sgstRate,
      cgstAmount,
      sgstAmount,
      totalGST,
      totalAmount,
      amountInWords: numberToWords(Math.round(totalAmount)),
      status: 'Pending',
      timestamp: new Date().toISOString()
    };
    
    addInvoice(invoice);
    alert(`✅ ${docType} saved!\nNumber: ${invoiceNumber}\nTotal: ${formatCurrency(totalAmount)}`);
    navigate('/invoices');
  };

  const handleClear = () => {
    if (confirm('Clear form?')) {
      window.location.reload();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleDocType = () => {
    setDocType(docType === 'INVOICE' ? 'QUOTATION' : 'INVOICE');
  };

  return (
    <div className="create-invoice-page">
      <div className="action-buttons no-print">
        <Button variant="secondary" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </Button>
        <Button onClick={toggleDocType}>
          Switch to {docType === 'INVOICE' ? 'Quotation' : 'Invoice'}
        </Button>
        <Button onClick={handleSave}>💾 Save {docType}</Button>
        <Button variant="secondary" onClick={handleClear}>🗑️ Clear Form</Button>
        <Button variant="secondary" onClick={handlePrint}>🖨️ Print (A4)</Button>
      </div>

      <div className="alert-box no-print">
        <strong>🎯 Auto-Generated {docType} Number:</strong>{' '}
        <span className="invoice-number-display">{invoiceNumber}</span>
        <p style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
          Optimized for A4 paper (210mm × 297mm). Company details loaded from Settings.
        </p>
      </div>

      <div className="invoice-container">
        <div className="header-section">
          <div className="logo-section">
            {logo ? (
              <img src={logo} alt="Company Logo" />
            ) : (
              <div className="logo-placeholder">
                <strong>No<br/>Logo</strong>
              </div>
            )}
          </div>

          <div className="company-info">
            <h1>{settings?.companyName || 'YOUR COMPANY NAME'}</h1>
            <p>{settings?.companyAddress || 'Set company details in Settings'}</p>
            <p>
              <strong>Phone:</strong> {settings?.companyPhone || '-'} |{' '}
              <strong>Email:</strong> {settings?.companyEmail || '-'}
            </p>
            <p>
              <strong>Website:</strong> {settings?.companyWebsite || '-'}
            </p>
          </div>
        </div>

        <div className="doc-header">
          <h2>{docType}</h2>
        </div>

        <table className="info-table">
          <tbody>
            <tr>
              <td style={{ width: '60%' }}>
                <h3>Bill To / Ship To</h3>
                <p>
                  <strong>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="editable-input"
                    />
                  </strong>
                </p>
                <p>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="editable-textarea"
                    rows={2}
                  />
                </p>
                <p>
                  <strong>Contact:</strong>{' '}
                  <input
                    type="text"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="editable-input"
                  />
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="editable-input"
                  />
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <input
                    type="text"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="editable-input"
                  />
                </p>
              </td>
              <td style={{ width: '40%' }}>
                <h3>{docType} Details</h3>
                <p>
                  <strong>{docType} No:</strong> {invoiceNumber}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  <input
                    type="text"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="editable-input"
                  />
                </p>
                <p>
                  <strong>Due Date:</strong>{' '}
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="editable-input"
                  />
                </p>
                <p>
                  <strong>PO Number:</strong>{' '}
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="editable-input"
                    placeholder="-"
                  />
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <ItemsTable items={items} onItemsChange={setItems} />

        <TotalsTable
          subtotal={subtotal}
          cgstRate={cgstRate}
          sgstRate={sgstRate}
          cgstAmount={cgstAmount}
          sgstAmount={sgstAmount}
          totalGST={totalGST}
          totalAmount={totalAmount}
          onCGSTRateChange={setCgstRate}
          onSGSTRateChange={setSgstRate}
        />

        <div className="amount-words">
          <strong>Amount in Words:</strong> {numberToWords(Math.round(totalAmount))}
        </div>

        <div className="footer-section">
          <div className="bank-details">
            <strong>BANK DETAILS:</strong> Bank: {settings?.bankName || '-'} | Acc:{' '}
            {settings?.bankAccount || '-'} | IFSC: {settings?.bankIFSC || '-'}
          </div>

          <div className="terms">
            <strong>Terms & Conditions:</strong>
            <ol>
              {settings?.termsAndConditions?.map((term, index) => (
                <li key={index}>{term}</li>
              )) || (
                <>
                  <li>Payment due within 30 days</li>
                  <li>Goods once sold will not be taken back</li>
                </>
              )}
            </ol>
          </div>

          <div className="signature">
            <p>
              <strong>For {settings?.companyName || 'YOUR COMPANY NAME'}</strong>
            </p>
            <div className="signature-line"></div>
            <p style={{ marginTop: '3px' }}>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};
