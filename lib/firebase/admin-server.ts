import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountJson = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function parseServiceAccount(): ServiceAccountJson | null {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64?.trim();
  if (b64) {
    try {
      const raw = Buffer.from(b64, "base64").toString("utf8");
      return JSON.parse(raw) as ServiceAccountJson;
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 invalide (base64 JSON attendu)",
      );
    }
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServiceAccountJson;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY invalide (JSON attendu)");
  }
}

export function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccount = parseServiceAccount();
  const projectId =
    serviceAccount?.project_id ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT;

  if (serviceAccount?.client_email && serviceAccount.private_key) {
    return initializeApp({
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
      projectId,
    });
  }

  throw new Error(
    "Admin Firebase non configuré : définissez FIREBASE_SERVICE_ACCOUNT_KEY_BASE64",
  );
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
