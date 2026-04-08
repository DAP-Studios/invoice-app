import { firebaseAuth } from "../lib/firebase.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Missing access token" });
    }

    const decoded = await firebaseAuth.verifyIdToken(token);
    if (!decoded?.uid) {
      return res.status(401).json({ error: "Invalid access token" });
    }

    req.user = {
      id: decoded.uid,
      email: decoded.email,
    };
    req.accessToken = token;
    next();
  } catch (error) {
    next(error);
  }
}
