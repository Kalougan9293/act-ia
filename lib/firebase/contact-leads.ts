import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  type Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export type ContactLead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  need: string;
  message: string;
  source: string;
  status: "new" | "contacted" | string;
  createdAt: Date | null;
};

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as Timestamp).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

export async function listContactLeads(): Promise<ContactLead[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const snap = await getDocs(
    query(collection(db, "contactLeads"), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      company: data.company ? String(data.company) : null,
      need: String(data.need ?? ""),
      message: String(data.message ?? ""),
      source: String(data.source ?? ""),
      status: String(data.status ?? "new"),
      createdAt: asDate(data.createdAt),
    };
  });
}

export async function markContactLeadContacted(id: string) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  await updateDoc(doc(db, "contactLeads", id), { status: "contacted" });
}
