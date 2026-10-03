import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { validatePassword } from "@/lib/auth/password";
import type { Structure } from "@/lib/admin/types";
import { mapStructure } from "@/lib/firebase/admin-data";
import { syncStructureInviteSeats } from "@/lib/firebase/seats";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

export function structureInviteLink(token: string, origin?: string) {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "https://act-ia-khaki.vercel.app");
  return `${base}/rejoindre/${token}`;
}

export async function ensureStructureInviteToken(
  structure: Structure,
): Promise<Structure> {
  const db = requireDb();
  const token = structure.inviteToken || crypto.randomUUID().replace(/-/g, "");
  const seatsMax = Math.max(1, Number(structure.billing.seats) || 1);
  const inviteRef = doc(db, "structureInvites", token);
  const existingInvite = await getDoc(inviteRef);

  if (!existingInvite.exists()) {
    await setDoc(inviteRef, {
      structureId: structure.id,
      name: structure.name,
      seatsMax,
      seatsUsed: 0,
      createdAt: serverTimestamp(),
    });
  }

  if (structure.inviteToken !== token) {
    try {
      await updateDoc(doc(db, "structures", structure.id), { inviteToken: token });
    } catch {
      await setDoc(
        doc(db, "structures", structure.id),
        {
          name: structure.name,
          createdAt: structure.createdAt,
          status: structure.status,
          archivedAt: structure.archivedAt,
          inviteToken: token,
          billing: structure.billing,
        },
        { merge: true },
      );
    }
  }

  const ready = { ...structure, inviteToken: token };
  await syncStructureInviteSeats(ready);
  return ready;
}

export async function getStructureInvite(token: string): Promise<{
  token: string;
  structureId: string;
  name: string;
  seatsMax: number;
  seatsUsed: number;
} | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "structureInvites", token));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    token: snap.id,
    structureId: String(data.structureId ?? ""),
    name: String(data.name ?? ""),
    seatsMax: Math.max(1, Number(data.seatsMax ?? 1)),
    seatsUsed: Math.max(0, Number(data.seatsUsed ?? 0)),
  };
}

export async function joinStructureWithInvite(params: {
  token: string;
  email: string;
  password: string;
}) {
  const check = validatePassword(params.password);
  if (!check.ok) throw new Error(check.message ?? "Mot de passe invalide");

  const invite = await getStructureInvite(params.token);
  if (!invite?.structureId) throw new Error("Lien d'invitation invalide");
  if (invite.seatsUsed >= invite.seatsMax) {
    throw new Error(
      `Nombre d'accès atteint (${invite.seatsMax}). Contactez votre RH pour élargir l'offre.`,
    );
  }

  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth || !db) throw new Error("Firebase non configuré");

  const email = params.email.trim().toLowerCase();
  const local = email.split("@")[0] ?? email;
  const name =
    local
      .replace(/[._+-]+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || email;

  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, email, params.password);
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "auth/email-already-in-use") {
      throw new Error("Ce compte a déjà un mot de passe. Utilisez Se connecter.");
    }
    throw e instanceof Error ? e : new Error("Création du compte impossible");
  }

  try {
    const inviteRef = doc(db, "structureInvites", params.token);
    const fresh = await getDoc(inviteRef);
    const seatsMax = Math.max(1, Number(fresh.data()?.seatsMax ?? invite.seatsMax));
    const seatsUsed = Math.max(0, Number(fresh.data()?.seatsUsed ?? invite.seatsUsed));
    if (seatsUsed >= seatsMax) {
      throw new Error(
        `Nombre d'accès atteint (${seatsMax}). Contactez votre RH pour élargir l'offre.`,
      );
    }

    const batch = writeBatch(db);
    batch.set(doc(db, "users", cred.user.uid), {
      email,
      name,
      role: "employee",
      structureId: invite.structureId,
      jobTitle: null,
      status: "active",
      lastLoginAt: serverTimestamp(),
      createdAt: new Date().toISOString().slice(0, 10),
      progressPercent: 0,
      certificateId: null,
      certifiedAt: null,
      quizScore: null,
      structureInviteToken: params.token,
    });
    batch.update(inviteRef, { seatsUsed: increment(1) });
    await batch.commit();
  } catch (e) {
    await deleteUser(cred.user).catch(() => undefined);
    throw e instanceof Error ? e : new Error("Inscription impossible");
  }

  return { structureId: invite.structureId };
}

export async function getStructurePublicName(structureId: string): Promise<string | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "structures", structureId));
  if (!snap.exists()) return null;
  return mapStructure(snap.id, snap.data() as Record<string, unknown>).name;
}
