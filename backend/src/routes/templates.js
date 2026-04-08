import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { firestore, mapDoc, now } from "../lib/firebase.js";

const router = Router();
router.use(requireAuth);

const templateSchema = z.object({
  name: z.string().min(2),
  layout: z.enum(["minimal", "modern-card", "classic-gst"]),
  config: z.object({
    colors: z.object({
      primary: z.string(),
      accent: z.string(),
      text: z.string(),
      background: z.string(),
    }),
    fontFamily: z.string(),
    logoPosition: z.enum(["left", "center", "right"]),
    sectionOrder: z.array(z.string()),
    showProductImages: z.boolean(),
    showQrCode: z.boolean(),
    showSuggestions: z.boolean(),
  }),
  is_active: z.boolean().default(true),
});

router.get("/", async (req, res, next) => {
  try {
    const snapshot = await firestore
      .collection("templates")
      .where("userId", "==", req.user.id)
      .get();

    const data = snapshot.docs
      .map(mapDoc)
      .sort((a, b) =>
        String(b.updated_at || "").localeCompare(String(a.updated_at || "")),
      );
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = templateSchema.parse(req.body);
    const docRef = firestore.collection("templates").doc();
    await docRef.set({
      userId: req.user.id,
      ...payload,
      created_at: now(),
      updated_at: now(),
    });

    const created = await docRef.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const payload = templateSchema.partial().parse(req.body);
    const ref = firestore.collection("templates").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.user.id) {
      return res.status(404).json({ error: "Template not found" });
    }

    await ref.set({ ...payload, updated_at: now() }, { merge: true });
    const updated = await ref.get();
    res.json(mapDoc(updated));
  } catch (error) {
    next(error);
  }
});

export default router;
