/**
 * Auth helpers Firebase — invitation RH / collaborateur sans « code » manuel.
 * Flux : createUser → sendPasswordResetEmail / generatePasswordResetLink
 */
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "./client";
import type { UserRole } from "@/lib/admin/types";

export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase non configuré");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logOut() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export async function sendResetPassword(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase non configuré");
  await sendPasswordResetEmail(auth, email);
}

/**
 * Création compte (côté admin / RH via Cloud Function idéalement).
 * En client : réservé aux tests ; en prod → Admin SDK + custom claims.
 */
export async function provisionUser(params: {
  email: string;
  temporaryPassword: string;
  name: string;
  role: Exclude<UserRole, "super_admin">;
  structureId: string;
}) {
  if (!isFirebaseConfigured()) throw new Error("Firebase non configuré");
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth || !db) throw new Error("Firebase non configuré");

  const cred = await createUserWithEmailAndPassword(
    auth,
    params.email,
    params.temporaryPassword,
  );

  await setDoc(doc(db, "users", cred.user.uid), {
    email: params.email,
    name: params.name,
    role: params.role,
    structureId: params.structureId,
    status: "invited",
    progressPercent: 0,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
    createdAt: serverTimestamp(),
    lastLoginAt: null,
  });

  await sendPasswordResetEmail(auth, params.email);
  return cred.user;
}

export type { User };
