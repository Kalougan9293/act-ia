import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { getStructure } from "@/lib/firebase/tenant-data";
import { releaseSeatIfEmployee } from "@/lib/firebase/seats";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

/**
 * Retire un utilisateur formation.
 * - Collaborateur : suppression du compte Firestore + progression.
 * - RH inscrit via le lien : désinscription formation uniquement (reste RH).
 */
export async function deleteEmployeeAsRh(params: {
  userId: string;
  structureId: string;
}): Promise<void> {
  const db = requireDb();
  const userRef = doc(db, "users", params.userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("Collaborateur introuvable");
  const data = snap.data();
  if (String(data.structureId ?? "") !== params.structureId) {
    throw new Error("Ce collaborateur n'appartient pas à votre structure");
  }

  const role = String(data.role ?? "");
  const formationEnrolled = Boolean(data.formationEnrolled);

  const [progressSnap, certsSnap, structure] = await Promise.all([
    getDocs(collection(db, "users", params.userId, "progress")),
    getDocs(collection(db, "users", params.userId, "certificates")),
    getStructure(params.structureId),
  ]);

  if (role === "rh") {
    if (!formationEnrolled) {
      throw new Error("Le compte RH n'est pas inscrit à la formation");
    }
    const batch = writeBatch(db);
    for (const d of progressSnap.docs) batch.delete(d.ref);
    for (const d of certsSnap.docs) batch.delete(d.ref);
    batch.update(userRef, {
      formationEnrolled: false,
      progressPercent: 0,
      certificateId: null,
      certifiedAt: null,
      quizScore: null,
      structureInviteToken: null,
    });
    await batch.commit();
    await releaseSeatIfEmployee(structure, "rh", true);
    return;
  }

  if (role !== "employee") {
    throw new Error("Suppression impossible pour ce type de compte");
  }

  const email = String(data.email ?? "").trim().toLowerCase();
  // firstLogin n'existe que pour les comptes encore « en attente »
  const firstLoginRef = email ? doc(db, "firstLogin", email) : null;
  const firstLoginSnap = firstLoginRef ? await getDoc(firstLoginRef) : null;

  const batch = writeBatch(db);
  for (const d of progressSnap.docs) batch.delete(d.ref);
  for (const d of certsSnap.docs) batch.delete(d.ref);
  batch.delete(userRef);
  if (firstLoginRef && firstLoginSnap?.exists()) {
    batch.delete(firstLoginRef);
  }
  await batch.commit();

  await releaseSeatIfEmployee(structure, "employee", true);
}

/** Annule une invitation personnelle pending (legacy). */
export async function deletePendingInviteAsRh(params: {
  token: string;
  structureId: string;
}): Promise<void> {
  const db = requireDb();
  const ref = doc(db, "invites", params.token);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  if (String(data.structureId ?? "") !== params.structureId) {
    throw new Error("Invitation hors structure");
  }
  await deleteDoc(ref);
}
