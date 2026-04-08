export function computeInvoiceTotals(items, isInterState) {
  const safeItems = Array.isArray(items) ? items : [];

  const enriched = safeItems.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unit_price || item.price || 0);
    const taxRate = Number(item.tax_rate || 18);
    const lineSubtotal = quantity * unitPrice;
    const lineTax = (lineSubtotal * taxRate) / 100;

    return {
      ...item,
      quantity,
      unit_price: unitPrice,
      tax_rate: taxRate,
      line_subtotal: round2(lineSubtotal),
      line_tax: round2(lineTax),
      line_total: round2(lineSubtotal + lineTax),
    };
  });

  const subtotal = round2(
    enriched.reduce((sum, item) => sum + item.line_subtotal, 0),
  );
  const totalTax = round2(
    enriched.reduce((sum, item) => sum + item.line_tax, 0),
  );
  const igst = isInterState ? totalTax : 0;
  const cgst = isInterState ? 0 : round2(totalTax / 2);
  const sgst = isInterState ? 0 : round2(totalTax / 2);
  const total = round2(subtotal + totalTax);

  return {
    items: enriched,
    subtotal,
    totalTax,
    cgst,
    sgst,
    igst,
    total,
  };
}

export function round2(value) {
  return Math.round(value * 100) / 100;
}
