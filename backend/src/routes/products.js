import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { firestore, mapDoc, now } from "../lib/firebase.js";

const router = Router();
router.use(requireAuth);

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  category: z.string().default("General"),
  hsn_code: z.string().default(""),
  image_url: z.string().url().optional().or(z.literal("")),
});

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const snapshot = await firestore
      .collection("products")
      .where("userId", "==", req.user.id)
      .get();

    let data = snapshot.docs.map(mapDoc);
    if (q) {
      const needle = q.toLowerCase();
      data = data.filter((item) =>
        String(item.name || "")
          .toLowerCase()
          .includes(needle),
      );
    }

    data.sort((a, b) =>
      String(b.created_at || "").localeCompare(String(a.created_at || "")),
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = productSchema.parse(req.body);
    const docRef = firestore.collection("products").doc();
    const data = {
      userId: req.user.id,
      ...payload,
      created_at: now(),
      updated_at: now(),
    };

    await docRef.set(data);
    const created = await docRef.get();
    res.status(201).json(mapDoc(created));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const payload = productSchema.partial().parse(req.body);
    const ref = firestore.collection("products").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.user.id) {
      return res.status(404).json({ error: "Product not found" });
    }

    await ref.set({ ...payload, updated_at: now() }, { merge: true });
    const updated = await ref.get();
    res.json(mapDoc(updated));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const ref = firestore.collection("products").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== req.user.id) {
      return res.status(404).json({ error: "Product not found" });
    }

    await ref.delete();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
