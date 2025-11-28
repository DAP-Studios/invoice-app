import React from "react";
import { InvoiceItem } from "../types";
import { calculateItemAmount } from "../utils/invoiceUtils";
import "./ItemsTable.css";

interface ItemsTableProps {
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  onItemsChange,
}) => {
  const addRow = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "Product/Service Description",
      hsn: "HSN001",
      unit: "Pcs",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const removeRow = (id: string) => {
    if (items.length > 1) {
      onItemsChange(items.filter((item) => item.id !== id));
    } else {
      alert("At least one item is required!");
    }
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = calculateItemAmount(
            Number(updated.quantity),
            Number(updated.rate)
          );
        }
        return updated;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  return (
    <div className="items-table-container">
      <table className="items-table">
        <thead>
          <tr>
            <th className="col-srno">SR</th>
            <th className="col-description">DESCRIPTION</th>
            <th className="col-hsn">HSN</th>
            <th className="col-unit">UNIT</th>
            <th className="col-quantity">QTY</th>
            <th className="col-rate">RATE</th>
            <th className="col-amount">AMOUNT</th>
            <th className="col-action">❌</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="item-row">
              <td className="col-srno">{index + 1}</td>
              <td className="col-description">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, "description", e.target.value)
                  }
                />
              </td>
              <td className="col-hsn">
                <input
                  type="text"
                  value={item.hsn}
                  onChange={(e) => updateItem(item.id, "hsn", e.target.value)}
                />
              </td>
              <td className="col-unit">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                />
              </td>
              <td className="col-quantity">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "quantity",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  min="0"
                  step="0.01"
                />
              </td>
              <td className="col-rate">
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    updateItem(item.id, "rate", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                />
              </td>
              <td className="col-amount">{item.amount.toFixed(2)}</td>
              <td className="col-action">
                <button
                  className="remove-btn"
                  onClick={() => removeRow(item.id)}
                  type="button"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-row-btn" onClick={addRow} type="button">
        + ADD ITEM
      </button>
    </div>
  );
};
