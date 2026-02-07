import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "../context/InvoiceContext";
import { Button } from "../components/Button";
import { ItemsTable } from "../components/ItemsTable";
import { TotalsTable } from "../components/TotalsTable";
import { Invoice, InvoiceItem } from "../types";
import {
  generateInvoiceNumber,
  calculateSubtotal,
  calculateTax,
  calculateGrandTotal,
  getTodayDate,
  getDueDate,
  numberToWords,
  formatCurrency,
} from "../utils/invoiceUtils";
import { loadLogo } from "../utils/storage";
import { exportInvoicePDF } from "../utils/exportUtils";
import "./CreateInvoice.css";

export const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, settings, addInvoice } = useInvoices();

  type DocType =
    | "INVOICE"
    | "QUOTATION"
    | "PURCHASE ORDER"
    | "PERFORMA INVOICE";
  const [docType, setDocType] = useState<DocType>("INVOICE");
  const [customerName, setCustomerName] = useState("Customer Name");
  const [customerAddress, setCustomerAddress] = useState("Customer Address");
  const [customerContact, setCustomerContact] = useState("Person Name");
  const [customerPhone, setCustomerPhone] = useState("+91 00000 00000");
  const [customerEmail, setCustomerEmail] = useState("customer@email.com");
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate());
  const [dueDate, setDueDate] = useState(getDueDate());
  const [poNumber, setPoNumber] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "Product/Service Description",
      hsn: "HSN001",
      unit: "Pcs",
      quantity: 1,
      rate: 1000,
      amount: 1000,
    },
  ]);

  const [cgstRate, setCgstRate] = useState(9);
  const [sgstRate, setSgstRate] = useState(9);

  const subtotal = calculateSubtotal(items);
  const cgstAmount = calculateTax(subtotal, cgstRate);
  const sgstAmount = calculateTax(subtotal, sgstRate);
  const totalGST = cgstAmount + sgstAmount;
  const totalAmount = calculateGrandTotal(subtotal, cgstAmount, sgstAmount);

  const invoiceNumber = generateInvoiceNumber(
    invoices,
    docType === "PURCHASE ORDER" || docType === "PERFORMA INVOICE"
      ? "INVOICE"
      : docType,
  );
  const [logo, setLogo] = useState<string | null>(null);
  const [savedInvoiceNo, setSavedInvoiceNo] = useState<string | null>(null);

  // Default company info - will be overridden by settings if available
  const defaultCompanyInfo = {
    companyName: "YOUR COMPANY NAME",
    companyAddress: "Company Address",
    companyPhone: "-",
    companyEmail: "-",
    companyWebsite: "-",
    gstNumber: "-",
    bankName: "-",
    bankAccount: "-",
    bankIFSC: "-",
    termsAndConditions: [
      "Payment due within 30 days",
      "Goods once sold will not be taken back",
    ],
  };

  // Use settings from context, fallback to defaults
  const companyInfo = settings || defaultCompanyInfo;

  useEffect(() => {
    const loadedLogo = loadLogo();
    setLogo(loadedLogo);
  }, []);

  // Debug: Log settings to console
  useEffect(() => {
    console.log("=== Settings Debug Info ===");
    console.log("Settings from context:", settings);
    console.log("Company info being used:", companyInfo);
    console.log("Settings loaded:", !!settings);
    console.log("Company Name:", companyInfo.companyName);
    console.log("==========================");
  }, [settings]);

  const handleSave = () => {
    const invoice: Invoice = {
      id: Date.now(),
      type:
        docType === "PURCHASE ORDER" || docType === "PERFORMA INVOICE"
          ? "INVOICE"
          : docType,
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
      status: "Pending",
      timestamp: new Date().toISOString(),
    };

    addInvoice(invoice);
    setSavedInvoiceNo(invoiceNumber);
    alert(
      `✅ ${docType} saved!\nNumber: ${invoiceNumber}\nTotal: ${formatCurrency(
        totalAmount,
      )}`,
    );
    navigate("/app/invoices");
  };

  const handleClear = () => {
    if (confirm("Clear form?")) {
      window.location.reload();
    }
  };

  const handleExportPDF = async () => {
    await exportInvoicePDF(savedInvoiceNo || invoiceNumber);
  };

  return (
    <div className="create-invoice-page">
      <div className="action-buttons no-print">
        <Button variant="secondary" onClick={() => navigate("/app")}>
          ← Back to Dashboard
        </Button>
        <div style={{ display: "inline-block", margin: "0 8px" }}>
          <label
            htmlFor="docTypeSelect"
            style={{ fontWeight: 500, marginRight: 6 }}
          >
            Document Type:
          </label>
          <select
            id="docTypeSelect"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className="editable-input"
            style={{ padding: "6px 12px", borderRadius: 4 }}
          >
            <option value="INVOICE">Invoice</option>
            <option value="QUOTATION">Quotation</option>
            <option value="PURCHASE ORDER">Purchase Order</option>
            <option value="PERFORMA INVOICE">Performa Invoice</option>
          </select>
        </div>
        <Button onClick={handleSave}>Save {docType}</Button>
        <Button variant="secondary" onClick={handleExportPDF}>
          ⬇ Download PDF
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          ✕ Clear Form
        </Button>
      </div>

      <div className="alert-box no-print">
        <strong>Auto-Generated {docType} Number:</strong>{" "}
        <span className="invoice-number-display">{invoiceNumber}</span>
        <p style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
          Optimized for A4 paper (210mm × 297mm). Company details loaded from
          Settings.{" "}
          {!settings && (
            <strong style={{ color: "#d32f2f" }}>
              No settings found - using defaults.{" "}
            </strong>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate("/app/settings")}
            style={{ fontSize: "11px", padding: "4px 8px", marginLeft: "8px" }}
          >
            Edit Settings
          </Button>
        </p>
      </div>

      <div id="invoice-content" className="invoice-container">
        {/* Main Invoice Table - Everything Inside Border */}
        <table className="main-invoice-table">
          <tbody>
            {/* Header with Logo and Company Info */}
            <tr>
              <td colSpan={3} style={{ padding: 0, border: "none" }}>
                <table className="header-section">
                  <tbody>
                    <tr>
                      {/* LEFT: LOGO */}
                      <td className="logo-cell" rowSpan={3}>
                        {logo ? (
                          <img
                            src={logo}
                            alt="Company Logo"
                            className="logo-img"
                          />
                        ) : (
                          <div className="logo-placeholder">
                            COMPANY
                            <br />
                            LOGO
                          </div>
                        )}
                      </td>

                      {/* COMPANY NAME */}
                      <td colSpan={2} className="company-name">
                        {companyInfo.companyName || "Company Name"}
                      </td>
                    </tr>

                    <tr>
                      {/* COMPANY ADDRESS */}
                      <td colSpan={2} className="company-address">
                        {companyInfo.companyAddress || "Company Address"}
                      </td>
                    </tr>

                    <tr>
                      {/* CONTACT INFO */}
                      <td className="info-box">
                        Phone: {companyInfo.companyPhone || "-"} <br />
                        Email: {companyInfo.companyEmail || "-"}
                      </td>

                      {/* WEBSITE + GST */}
                      <td className="info-box">
                        Website: {companyInfo.companyWebsite || "-"} <br />
                        GST: {companyInfo.gstNumber || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Tax Invoice Title */}
            <tr>
              <td colSpan={3} className="doc-header-cell">
                <h2>{docType}</h2>
              </td>
            </tr>

            {/* Invoice Details Grid */}
            <tr>
              <td colSpan={3} style={{ padding: 0, border: "none" }}>
                <table className="info-table">
                  <tbody>
                    <tr>
                      <td style={{ width: "60%" }} rowSpan={2}>
                        <h3>Buyer Detail (Bill To)</h3>
                        <p>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="editable-input"
                            style={{ fontWeight: "bold", width: "100%" }}
                          />
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
                          <strong>Contact Person:</strong>{" "}
                          <input
                            type="text"
                            value={customerContact}
                            onChange={(e) => setCustomerContact(e.target.value)}
                            className="editable-input"
                          />
                        </p>
                        <p>
                          <strong>Contact No:</strong>{" "}
                          <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="editable-input"
                          />
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          <input
                            type="text"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="editable-input"
                          />
                        </p>
                      </td>
                      <td style={{ width: "40%" }} colSpan={2}>
                        <h3>{docType} Details</h3>
                        <p>
                          <strong>{docType} No:</strong> {invoiceNumber}
                        </p>
                        <p>
                          <strong>{docType} Date:</strong>{" "}
                          <input
                            type="text"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="editable-input"
                          />
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <p>
                          <strong>Due Date:</strong>{" "}
                          <input
                            type="text"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="editable-input"
                          />
                        </p>
                        <p>
                          <strong>PO No:</strong>{" "}
                          <input
                            type="text"
                            value={poNumber}
                            onChange={(e) => setPoNumber(e.target.value)}
                            className="editable-input"
                            placeholder="N/A"
                          />
                        </p>
                      </td>
                    </tr>
                    {/* <tr>
              <td>
                <h3>Delivery Address (Ship To)</h3>
                <p style={{ fontWeight: "bold" }}>{customerName}</p>
                <p>{customerAddress}</p>
                <p>Contact: {customerContact}</p>
                <p>Phone: {customerPhone}</p>
              </td>
              <td colSpan={2}></td>
            </tr> */}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Items Table */}
            <tr>
              <td colSpan={3} style={{ padding: 0, border: "none" }}>
                <ItemsTable items={items} onItemsChange={setItems} />
              </td>
            </tr>

            {/* Totals Table */}
            <tr>
              <td colSpan={3} style={{ padding: 0, border: "none" }}>
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
              </td>
            </tr>

            {/* Amount in Words */}
            <tr>
              <td colSpan={3} className="amount-words-cell">
                <strong>Total Amount in Words:</strong>{" "}
                {numberToWords(Math.round(totalAmount))}
              </td>
            </tr>

            {/* Footer Section */}
            <tr>
              <td colSpan={3} className="footer-cell">
                <div className="footer-section">
                  <div className="bank-details">
                    <strong>BANK DETAILS:</strong>
                    <p style={{ margin: "4px 0" }}>
                      Bank Name: {companyInfo.bankName || "-"} | Bank A/C:{" "}
                      {companyInfo.bankAccount || "-"} | Bank IFSC:{" "}
                      {companyInfo.bankIFSC || "-"}
                    </p>
                  </div>

                  <div className="terms">
                    <strong>Terms & Conditions:</strong>
                    <ol>
                      {companyInfo.termsAndConditions &&
                      companyInfo.termsAndConditions.length > 0 ? (
                        companyInfo.termsAndConditions.map((term, index) => (
                          <li key={index}>{term}</li>
                        ))
                      ) : (
                        <>
                          <li>
                            Goods once sold will not be taken back unless
                            specifically agreed by us.
                          </li>
                          <li>
                            Goods returned should be accompanied by valid
                            invoice for acceptance.
                          </li>
                          <li>
                            We will not accept any claim for compensation in
                            case for any reason you are not able to avail cenvat
                            Credit of this invoice.
                          </li>
                          <li>
                            Acceptance of material will qualify us for full
                            payment of this invoice.
                          </li>
                          <li>Subject to jurisdiction.</li>
                        </>
                      )}
                    </ol>
                  </div>

                  <div className="signature">
                    <p>
                      <strong>
                        For {companyInfo.companyName || "YOUR COMPANY NAME"}
                      </strong>
                    </p>
                    <div className="signature-line"></div>
                    <p style={{ marginTop: "3px" }}>AUTHORISED SIGNATORY</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          className="no-print"
          style={{
            marginTop: "10px",
            padding: "6px",
            background: "#f0f0f0",
            borderRadius: "4px",
            textAlign: "center",
            fontSize: "9px",
            color: "#666",
          }}
        >
          This is computer generated {docType.toLowerCase()} no signature
          required.
        </div>
      </div>
    </div>
  );
};
