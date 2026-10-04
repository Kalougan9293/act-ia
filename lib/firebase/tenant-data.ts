import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { CompanyModuleContent, PlatformUser, Structure } from "@/lib/admin/types";
import { mapStructure, mapUser } from "@/lib/firebase/admin-data";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

export async function getStructure(structureId: string): Promise<Structure | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "structures", structureId));
  if (!snap.exists()) return null;
  return mapStructure(snap.id, snap.data() as Record<string, unknown>);
}

export async function saveCompanyModule(
  structureId: string,
  companyModule: CompanyModuleContent,
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, "structures", structureId), { companyModule });
}

export async function listUsersByStructure(structureId: string): Promise<PlatformUser[]> {
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("structureId", "==", structureId)),
  );
  return snap.docs.map((d) => mapUser(d.id, d.data() as Record<string, unknown>));
}
