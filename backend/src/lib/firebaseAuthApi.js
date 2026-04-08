import { env } from "../config/env.js";

const firebaseAuthBase = "https://identitytoolkit.googleapis.com/v1/accounts";

async function authRequest(endpoint, payload) {
  const response = await fetch(
    `${firebaseAuthBase}:${endpoint}?key=${env.firebaseApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Firebase auth request failed");
  }
  return data;
}

export function signUpWithEmailPassword(email, password) {
  return authRequest("signUp", {
    email,
    password,
    returnSecureToken: true,
  });
}

export function signInWithEmailPassword(email, password) {
  return authRequest("signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
}
