import admin from "firebase-admin";
import { env } from "../config/env.js";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey.replace(/\\n/g, "\n"),
    }),
  });
}

export const firebaseAuth = admin.auth();
export const firestore = admin.firestore();

export function collectionByUser(name, userId) {
  return firestore.collection(name).where("userId", "==", userId);
}

export function mapDoc(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    created_at:
      data.created_at?.toDate?.()?.toISOString?.() || data.created_at || null,
    updated_at:
      data.updated_at?.toDate?.()?.toISOString?.() || data.updated_at || null,
    date:
      data.date?.toDate?.()?.toISOString?.()?.slice(0, 10) || data.date || null,
  };
}

export function now() {
  return admin.firestore.FieldValue.serverTimestamp();
}
