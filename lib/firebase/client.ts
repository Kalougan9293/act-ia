import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  const existing = getApps().find((item) => item.name === "[DEFAULT]");
  if (existing) return existing;
  return initializeApp(firebaseConfig);
}

let auth: Auth | undefined;
let db: Firestore | undefined;
let secondaryAuth: Auth | undefined;

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) auth = getAuth(firebaseApp);
  return auth;
}

export function getFirebaseDb() {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) db = getFirestore(firebaseApp);
  return db;
}

/** Auth isolée : créer un compte ne déconnecte pas la session en cours. */
export function getSecondaryAuth() {
  if (!isFirebaseConfigured()) return null;
  if (secondaryAuth) return secondaryAuth;
  let secondary: FirebaseApp;
  try {
    secondary = getApp("Secondary");
  } catch {
    secondary = initializeApp(firebaseConfig, "Secondary");
  }
  try {
    secondaryAuth = initializeAuth(secondary, { persistence: inMemoryPersistence });
  } catch {
    secondaryAuth = getAuth(secondary);
  }
  return secondaryAuth;
}
