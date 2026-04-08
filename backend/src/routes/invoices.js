import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { firestore, mapDoc, now } from "../lib/firebase.js";
import { computeInvoiceTotals } from "../utils/invoice.js";

const router = Router();
router.use(requireAuth);

const invoiceItemSchema = z.object({
  product_id: z.string().optional().nullable(),
  product_name: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
  tax_rate: z.number().nonnegative().max(100).default(18),
  image_url: z.string().url().optional().or(z.literal("")),
  hsn_code: z.string().optional().default(""),
  category: z.string().optional().default("General"),
});

const createInvoiceSchema = z.object({
  date: z.string(),
  customer_name: z.string().min(2),
  customer_phone: z.string().min(8),
  customer_email: z.string().email().optional().or(z.literal("")),
  customer_address: z.string().default(""),
  place_of_supply: z.string().min(2),
  is_inter_state: z.boolean().default(false),
  notes: z.string().optional().default(""),
  items: z.array(invoiceItemSchema).min(1),
});

async function getNextInvoiceNumber(userId) {
  const snap = await firestore
    .collection("invoices")
    .where("userId", "==", userId)
    .get();

  let max = 0;
  for (const doc of snap.docs) {
    const value = Number(doc.data().invoice_number || 0);
    if (value > max) {
      max = value;
    }
  }

  return max + 1;
}

router.get("/", async (req, res, next) => {
  try {
    const snapshot = await firestore
      .collection("invoices")
      .where("userId", "==", req.user.id)
      .get();

    const data = snapshot.docs
      .map(mapDoc)
      .sort((a, b) =>
        String(b.created_at || "").localeCompare(String(a.created_at || "")),
      );

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = createInvoiceSchema.parse(req.body);
    const invoiceNumber = await getNextInvoiceNumber(req.user.id);
    const totals = computeInvoiceTotals(payload.items, payload.is_inter_state);

    const invoiceRef = firestore.collection("invoices").doc();

    const invoiceItems = totals.items.map((item) => ({
      invoice_id: invoiceRef.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate,
      line_subtotal: item.line_subtotal,
      line_tax: item.line_tax,
      line_total: item.line_total,
      image_url: item.image_url || "",
      hsn_code: item.hsn_code || "",
      category: item.category || "General",
    }));

    await invoiceRef.set({
      userId: req.user.id,
      invoice_number: invoiceNumber,
      date: payload.date,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_email: payload.customer_email,
      customer_address: payload.customer_address,
      place_of_supply: payload.place_of_supply,
      is_inter_state: payload.is_inter_state,
      subtotal: totals.subtotal,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      total_tax: totals.totalTax,
      total_amount: totals.total,
      notes: payload.notes,
      invoice_items: invoiceItems,
      created_at: now(),
      updated_at: now(),
    });

    const created = await invoiceRef.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const invoiceSnap = await firestore
      .collection("invoices")
      .doc(req.params.id)
      .get();
    if (!invoiceSnap.exists || invoiceSnap.data()?.userId !== req.user.id) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const invoice = mapDoc(invoiceSnap);

    const [businessSnap, templateSnap, suggestionsSnap] = await Promise.all([
      firestore.collection("businesses").doc(req.user.id).get(),
      firestore
        .collection("templates")
        .where("userId", "==", req.user.id)
        .where("is_active", "==", true)
        .limit(1)
        .get(),
      firestore
        .collection("products")
        .where("userId", "==", req.user.id)
        .limit(5)
        .get(),
    ]);

    const business = businessSnap.exists ? businessSnap.data() : null;
    const template = templateSnap.empty ? null : mapDoc(templateSnap.docs[0]);
    const suggestions = suggestionsSnap.docs.map(mapDoc);

    res.json({
      invoice,
      business,
      template,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
