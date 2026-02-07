import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInvoices } from "../context/InvoiceContext";
import { Button } from "../components/Button";
import { ItemsTable } from "../components/ItemsTable";
import { TotalsTable } from "../components/TotalsTable";
import { Invoice, InvoiceItem } from "../types";
import {
  calculateSubtotal,
  calculateTax,
  calculateGrandTotal,
  numberToWords,
  formatCurrency,
} from "../utils/invoiceUtils";
import { loadLogo } from "../utils/storage";
import { exportInvoicePDF } from "../utils/exportUtils";
import "./CreateInvoice.css";

export const EditInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { invoices, updateInvoice, settings } = useInvoices();

  const invoice = invoices.find((inv) => inv.id === parseInt(id || ""));

  type DocType =
    | "INVOICE"
    | "QUOTATION"
    | "PURCHASE ORDER"
    | "PERFORMA INVOICE";

  const [docType, setDocType] = useState<DocType>(
    (invoice?.type as DocType) || "INVOICE",
  );
  const [customerName, setCustomerName] = useState(invoice?.customerName || "");
  const [customerAddress, setCustomerAddress] = useState(
    invoice?.customerAddress || "",
  );
  const [customerContact, setCustomerContact] = useState(
    invoice?.customerContact || "",
  );
  const [customerPhone, setCustomerPhone] = useState(
    invoice?.customerPhone || "",
  );
  const [customerEmail, setCustomerEmail] = useState(
    invoice?.customerEmail || "",
  );
  const [invoiceDate, setInvoiceDate] = useState(invoice?.date || "");
  const [dueDate, setDueDate] = useState(invoice?.dueDate || "");
  const [poNumber, setPoNumber] = useState(invoice?.poNumber || "");
  const [items, setItems] = useState<InvoiceItem[]>(invoice?.items || []);
  const [cgstRate, setCgstRate] = useState(invoice?.cgstRate || 9);
  const [sgstRate, setSgstRate] = useState(invoice?.sgstRate || 9);
  const [status, setStatus] = useState<"Paid" | "Pending" | "Draft">(
    invoice?.status || "Pending",
  );
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadedLogo = loadLogo();
    setLogo(loadedLogo);
  }, []);

  if (!invoice) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Invoice not found</h2>
        <Button onClick={() => navigate("/app/invoices")}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const subtotal = calculateSubtotal(items);
  const cgstAmount = calculateTax(subtotal, cgstRate);
  const sgstAmount = calculateTax(subtotal, sgstRate);
  const totalGST = cgstAmount + sgstAmount;
  const totalAmount = calculateGrandTotal(subtotal, cgstAmount, sgstAmount);

  const handleSave = async () => {
    const updatedInvoice: Partial<Invoice> = {
      type:
        docType === "PURCHASE ORDER" || docType === "PERFORMA INVOICE"
          ? "INVOICE"
          : docType,
      customerName,
      customerAddress,
      customerContact,
      customerPhone,
      customerEmail,
      date: invoiceDate,
      dueDate,
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
      status,
    };

    await updateInvoice(invoice.id, updatedInvoice);
    alert(
      `✅ ${docType} updated successfully!\nTotal: ${formatCurrency(
        totalAmount,
      )}`,
    );
    navigate("/app/invoices");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    await exportInvoicePDF(invoice.invoiceNo);
  };

  return (
    <div className="create-invoice-page">
      <div className="action-buttons no-print">
        <Button variant="secondary" onClick={() => navigate("/app/invoices")}>
          ← Back to Invoices
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
        <Button onClick={handleSave}>💾 Update {docType}</Button>
        <Button variant="secondary" onClick={handleExportPDF}>
          📥 Export PDF
        </Button>
        <Button onClick={handlePrint}>🖨️ Print</Button>
      </div>

      {/* Invoice Content */}
      <div id="invoice-content" className="invoice-container">
        {/* Company Header */}
        <div className="invoice-header" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: "0 0 5px 0",
                }}
              >
                {settings?.companyName || "YOUR COMPANY NAME"}
              </h1>
              <p style={{ margin: "2px 0", fontSize: "12px", color: "#666" }}>
                {settings?.companyWebsite && (
                  <span>
                    Website:{" "}
                    <a
                      href={`https://${settings.companyWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0066cc" }}
                    >
                      {settings.companyWebsite}
                    </a>{" "}
                    |{" "}
                  </span>
                )}
                Phone: <span>{settings?.companyPhone || "-"}</span> | Email:{" "}
                <span>{settings?.companyEmail || "-"}</span>
              </p>
              <hr style={{ margin: "8px 0", borderTop: "2px solid #000" }} />
            </div>
            {logo && (
              <div style={{ marginLeft: "20px", maxWidth: "80px" }}>
                <img
                  src={logo}
                  alt="Company Logo"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Document Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              margin: "0",
              padding: "8px 20px",
              border: "2px solid #000",
              display: "inline-block",
            }}
          >
            {docType}
          </h2>
        </div>

        {/* Bill To and Invoice Details */}
        <table
          style={{
            width: "100%",
            marginBottom: "20px",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  width: "50%",
                  verticalAlign: "top",
                }}
              >
                <div>
                  <strong>BILL TO:</strong>
                  <div style={{ marginTop: "8px" }}>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="editable-input"
                      style={{
                        fontWeight: "bold",
                        marginBottom: "4px",
                        width: "100%",
                        border: "none",
                        padding: "0",
                        fontSize: "13px",
                      }}
                      placeholder="Customer Name"
                    />
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="editable-input"
                      style={{
                        fontSize: "13px",
                        whiteSpace: "pre-wrap",
                        marginTop: "4px",
                        width: "100%",
                        border: "none",
                        padding: "0",
                        fontFamily: "inherit",
                        resize: "none",
                        minHeight: "60px",
                      }}
                      placeholder="Customer Address"
                    />
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      <strong>Contact: </strong>
                      <input
                        type="text"
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        className="editable-input"
                        style={{
                          border: "none",
                          padding: "0",
                          fontSize: "inherit",
                          width: "auto",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      <strong>Phone: </strong>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="editable-input"
                        style={{
                          border: "none",
                          padding: "0",
                          fontSize: "inherit",
                          width: "auto",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      <strong>Email: </strong>
                      <input
                        type="text"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="editable-input"
                        style={{
                          border: "none",
                          padding: "0",
                          fontSize: "inherit",
                          width: "auto",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "10px",
                  width: "50%",
                  verticalAlign: "top",
                }}
              >
                <div>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>{docType} No:</strong>{" "}
                    <span style={{ color: "#d9534f" }}>
                      {invoice?.invoiceNo}
                    </span>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Date:</strong>
                    <input
                      type="text"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="editable-input"
                      style={{
                        border: "none",
                        padding: "0",
                        fontSize: "inherit",
                        width: "auto",
                        marginLeft: "4px",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Payment Due:</strong>
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="editable-input"
                      style={{
                        border: "none",
                        padding: "0",
                        fontSize: "inherit",
                        width: "auto",
                        marginLeft: "4px",
                      }}
                    />
                  </div>
                  <div>
                    <strong>Purchase Order Number:</strong>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="editable-input"
                      style={{
                        border: "none",
                        padding: "0",
                        fontSize: "inherit",
                        width: "auto",
                        marginLeft: "4px",
                      }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <ItemsTable items={items} onItemsChange={setItems} />

        {/* Totals Table */}
        <TotalsTable
          subtotal={subtotal}
          cgstRate={cgstRate}
          onCGSTRateChange={setCgstRate}
          sgstRate={sgstRate}
          onSGSTRateChange={setSgstRate}
          cgstAmount={cgstAmount}
          sgstAmount={sgstAmount}
          totalGST={totalGST}
          totalAmount={totalAmount}
        />

        {/* Bank Details and Notes */}
        {settings && (
          <div style={{ marginTop: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "10px",
                      width: "50%",
                    }}
                  >
                    <div>
                      <strong>AMOUNT IN WORDS:</strong>{" "}
                      <span style={{ color: "#d9534f" }}>
                        {numberToWords(Math.round(totalAmount)).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "10px",
                      width: "50%",
                    }}
                  ></td>
                </tr>
              </tbody>
            </table>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "10px" }}>
                    <div>
                      <strong>BANK DETAILS:</strong>
                      <div style={{ fontSize: "12px", marginTop: "4px" }}>
                        <div>
                          <strong>Bank Name:</strong> {settings.bankName}
                        </div>
                        <div>
                          <strong>Account Number:</strong>{" "}
                          {settings.bankAccount}
                        </div>
                        <div>
                          <strong>IFSC Code:</strong> {settings.bankIFSC}
                        </div>
                        {settings.gstNumber && (
                          <div style={{ marginTop: "8px" }}>
                            <strong>GST Number:</strong> {settings.gstNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Terms and Conditions */}
            <div
              style={{
                marginTop: "10px",
                borderTop: "1px solid #000",
                paddingTop: "10px",
              }}
            >
              <strong>TERMS & CONDITIONS:</strong>
              <ul
                style={{
                  marginTop: "4px",
                  marginBottom: "0",
                  fontSize: "12px",
                  paddingLeft: "20px",
                }}
              >
                {settings.termsAndConditions.map((term, index) => (
                  <li key={index} style={{ marginBottom: "2px" }}>
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            {/* Signature Section */}
            <div style={{ marginTop: "30px" }}>
              <div style={{ textAlign: "right", marginRight: "40px" }}>
                <div
                  style={{
                    borderTop: "1px solid #000",
                    width: "200px",
                    marginLeft: "auto",
                  }}
                >
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>
                    Authorized Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Selection */}
        <div className="status-section no-print" style={{ marginTop: "20px" }}>
          <label htmlFor="statusSelect">Status:</label>
          <select
            id="statusSelect"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "Paid" | "Pending" | "Draft")
            }
            className="editable-input"
          >
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>
    </div>
  );
};
