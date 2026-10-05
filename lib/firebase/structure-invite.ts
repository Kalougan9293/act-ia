import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Structure } from "@/lib/admin/types";
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
          companyModule: structure.companyModule,
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
    seatsMax: Math.max(1, Number(data.seatsMax ?? 1) || 1),
    seatsUsed: Math.max(0, Number(data.seatsUsed ?? 0)),
  };
}
