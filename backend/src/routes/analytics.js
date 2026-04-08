import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { firestore, mapDoc, now } from "../lib/firebase.js";

const router = Router();
router.use(requireAuth);

const eventSchema = z.object({
  event_type: z.enum(["invoice_view", "product_click", "reorder_click"]),
  invoice_id: z.string().optional().nullable(),
  product_id: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().default({}),
});

router.post("/events", async (req, res, next) => {
  try {
    const payload = eventSchema.parse(req.body);
    const ref = firestore.collection("analytics_events").doc();
    await ref.set({
      userId: req.user.id,
      ...payload,
      created_at: now(),
    });

    const created = await ref.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    next(error);
  }
});

router.get("/summary", async (req, res, next) => {
  try {
    const [invoicesSnap, eventsSnap] = await Promise.all([
      firestore.collection("invoices").where("userId", "==", req.user.id).get(),
      firestore
        .collection("analytics_events")
        .where("userId", "==", req.user.id)
        .get(),
    ]);

    const invoices = invoicesSnap.docs.map((doc) => doc.data());
    const events = eventsSnap.docs.map((doc) => doc.data());
    const items = invoices.flatMap((invoice) => invoice.invoice_items || []);

    const invoiceViews = events.filter(
      (e) => e.event_type === "invoice_view",
    ).length;
    const reorderClicks = events.filter(
      (e) => e.event_type === "reorder_click",
    ).length;

    const productMap = new Map();
    for (const item of items) {
      productMap.set(
        item.product_name,
        (productMap.get(item.product_name) || 0) + Number(item.quantity || 0),
      );
    }

    const topProducts = [...productMap.entries()]
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const customerCounts = new Map();
    for (const invoice of invoices) {
      const key = invoice.customer_phone || "unknown";
      customerCounts.set(key, (customerCounts.get(key) || 0) + 1);
    }

    const repeatCustomers = [...customerCounts.values()].filter(
      (count) => count > 1,
    ).length;
    const conversionRate = invoiceViews
      ? Number(((reorderClicks / invoiceViews) * 100).toFixed(2))
      : 0;

    res.json({
      totalInvoices: invoices.length,
      topProducts,
      repeatCustomers,
      conversionRate,
      invoiceViews,
      reorderClicks,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
