import { Router } from "express";
import { z } from "zod";
import { firestore, now } from "../lib/firebase.js";
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from "../lib/firebaseAuthApi.js";

const router = Router();

function normalizeBusiness(data) {
  if (!data) {
    return null;
  }

  return {
    ...data,
    created_at:
      data.created_at?.toDate?.()?.toISOString?.() || data.created_at || null,
    updated_at:
      data.updated_at?.toDate?.()?.toISOString?.() || data.updated_at || null,
  };
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  business_name: z.string().min(2),
  gstin: z.string().min(5),
  address: z.string().min(5),
  phone: z.string().min(8),
  logo: z.string().url().optional().or(z.literal("")),
});

router.post("/signup", async (req, res, next) => {
  try {
    const payload = signupSchema.parse(req.body);
    const { email, password, ...businessData } = payload;

    const authData = await signUpWithEmailPassword(email, password);
    const userId = authData.localId;

    await firestore
      .collection("businesses")
      .doc(userId)
      .set(
        {
          userId,
          ...businessData,
          created_at: now(),
          updated_at: now(),
        },
        { merge: true },
      );

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: authData.localId,
        email: authData.email,
      },
      session: {
        access_token: authData.idToken,
        refresh_token: authData.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const authData = await signInWithEmailPassword(email, password);

    const businessSnap = await firestore
      .collection("businesses")
      .doc(authData.localId)
      .get();
    const business = businessSnap.exists
      ? normalizeBusiness(businessSnap.data())
      : null;

    return res.json({
      user: {
        id: authData.localId,
        email: authData.email,
      },
      session: {
        access_token: authData.idToken,
        refresh_token: authData.refreshToken,
      },
      business,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
