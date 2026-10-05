import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import type { PlatformUser, UserRole } from "@/lib/admin/types";
import { validatePassword } from "@/lib/auth/password";

export type InviteRecord = {
  token: string;
  email: string;
  name: string;
  role: Exclude<UserRole, "super_admin">;
  structureId: string;
  jobTitle: string | null;
  status: "pending" | "used";
  createdAt: string;
};

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function inviteToPlatformUser(invite: InviteRecord): PlatformUser {
  return {
    id: `invite:${invite.token}`,
    email: invite.email,
    name: invite.name,
    role: invite.role,
    structureId: invite.structureId,
    status: "invited",
    jobTitle: invite.jobTitle,
    lastLoginAt: null,
    createdAt: invite.createdAt,
    progressPercent: invite.role === "employee" ? 0 : 0,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
  };
}

export function inviteLink(token: string, origin?: string) {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "https://act-ia-khaki.vercel.app");
  return `${base}/invitation/${token}`;
}

export async function createInvite(params: {
  email: string;
  name: string;
  role: Exclude<UserRole, "super_admin">;
  structureId: string;
  jobTitle?: string;
}): Promise<{ invite: InviteRecord; link: string }> {
  const db = requireDb();
  const email = params.email.trim().toLowerCase();
  const jobTitle = params.jobTitle?.trim() || null;
  const token = crypto.randomUUID().replace(/-/g, "");

  if (params.role === "employee") {
    const structureSnap = await getDoc(doc(db, "structures", params.structureId));
    if (!structureSnap.exists()) throw new Error("Structure introuvable");
    const billing = structureSnap.data().billing as { seats?: number } | undefined;
    const seatsMax = Math.max(1, Number(billing?.seats ?? 1) || 1);
    const inviteToken = structureSnap.data().inviteToken
      ? String(structureSnap.data().inviteToken)
      : null;
    let seatsUsed = 0;
    if (inviteToken) {
      const seatSnap = await getDoc(doc(db, "structureInvites", inviteToken));
      seatsUsed = Math.max(0, Number(seatSnap.data()?.seatsUsed ?? 0));
    }
    if (seatsUsed >= seatsMax) {
      throw new Error(
        `Nombre d'accès atteint (${seatsMax}). Impossible d'inviter plus de collaborateurs.`,
      );
    }
  }

  // Invalider les anciennes invitations pending pour le même e-mail + structure
  const existing = await getDocs(
    query(
      collection(db, "invites"),
      where("structureId", "==", params.structureId),
      where("status", "==", "pending"),
    ),
  );
  await Promise.all(
    existing.docs
      .filter((d) => String(d.data().email ?? "").toLowerCase() === email)
      .map((d) => deleteDoc(d.ref)),
  );

  const invite: InviteRecord = {
    token,
    email,
    name: params.name.trim(),
    role: params.role,
    structureId: params.structureId,
    jobTitle,
    status: "pending",
    createdAt: todayIso(),
  };

  await setDoc(doc(db, "invites", token), {
    email: invite.email,
    name: invite.name,
    role: invite.role,
    structureId: invite.structureId,
    jobTitle: invite.jobTitle,
    status: "pending",
    createdAt: invite.createdAt,
    createdAtTs: serverTimestamp(),
  });

  return { invite, link: inviteLink(token) };
}

function mapInviteDoc(id: string, data: Record<string, unknown>): InviteRecord {
  return {
    token: id,
    email: String(data.email ?? ""),
    name: String(data.name ?? ""),
    role: data.role as InviteRecord["role"],
    structureId: String(data.structureId ?? ""),
    jobTitle: data.jobTitle ? String(data.jobTitle) : null,
    status: "pending",
    createdAt: String(data.createdAt ?? todayIso()),
  };
}

export async function listPendingInvites(): Promise<InviteRecord[]> {
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, "invites"), where("status", "==", "pending")),
  );
  return snap.docs.map((d) => mapInviteDoc(d.id, d.data() as Record<string, unknown>));
}

export async function listPendingInvitesByStructure(structureId: string): Promise<InviteRecord[]> {
  const db = requireDb();
  const snap = await getDocs(
    query(
      collection(db, "invites"),
      where("structureId", "==", structureId),
      where("status", "==", "pending"),
    ),
  );
  return snap.docs.map((d) => mapInviteDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getInvite(token: string): Promise<InviteRecord | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "invites", token));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.status !== "pending") return null;
  return {
    token: snap.id,
    email: String(data.email ?? ""),
    name: String(data.name ?? ""),
    role: data.role as InviteRecord["role"],
    structureId: String(data.structureId ?? ""),
    jobTitle: data.jobTitle ? String(data.jobTitle) : null,
    status: "pending",
    createdAt: String(data.createdAt ?? todayIso()),
  };
}

export async function acceptInvite(params: {
  token: string;
  password: string;
}): Promise<{ role: UserRole }> {
  const check = validatePassword(params.password);
  if (!check.ok) throw new Error(check.message ?? "Mot de passe invalide");

  const invite = await getInvite(params.token);
  if (!invite) throw new Error("Invitation invalide ou déjà utilisée");

  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth || !db) throw new Error("Firebase non configuré");

  // Collaborateurs : plafond = capacité facturée (billing.seats)
  if (invite.role === "employee") {
    const structureSnap = await getDoc(doc(db, "structures", invite.structureId));
    if (!structureSnap.exists()) throw new Error("Structure introuvable");
    const billing = structureSnap.data().billing as { seats?: number } | undefined;
    const seatsMax = Math.max(1, Number(billing?.seats ?? 1) || 1);
    const inviteToken = structureSnap.data().inviteToken
      ? String(structureSnap.data().inviteToken)
      : null;
    let seatsUsed = 0;
    if (inviteToken) {
      const seatSnap = await getDoc(doc(db, "structureInvites", inviteToken));
      seatsUsed = Math.max(0, Number(seatSnap.data()?.seatsUsed ?? 0));
    }
    if (seatsUsed >= seatsMax) {
      throw new Error(
        `Nombre d'accès atteint (${seatsMax}). Contactez votre RH pour élargir l'offre.`,
      );
    }
  }

  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, invite.email, params.password);
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "auth/email-already-in-use") {
      throw new Error("Ce compte a déjà un mot de passe. Utilisez Se connecter.");
    }
    throw e instanceof Error ? e : new Error("Activation impossible");
  }

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, "users", cred.user.uid), {
      email: invite.email,
      name: invite.name,
      role: invite.role,
      structureId: invite.structureId,
      jobTitle: invite.jobTitle,
      status: "active",
      lastLoginAt: serverTimestamp(),
      createdAt: invite.createdAt,
      progressPercent: invite.role === "employee" ? 0 : null,
      certificateId: null,
      certifiedAt: null,
      quizScore: null,
      inviteToken: params.token,
    });
    batch.set(
      doc(db, "invites", params.token),
      { status: "used", usedAt: serverTimestamp(), usedBy: cred.user.uid },
      { merge: true },
    );

    if (invite.role === "employee") {
      const structureSnap = await getDoc(doc(db, "structures", invite.structureId));
      const inviteToken = structureSnap.data()?.inviteToken
        ? String(structureSnap.data()?.inviteToken)
        : null;
      if (inviteToken) {
        batch.update(doc(db, "structureInvites", inviteToken), {
          seatsUsed: increment(1),
        });
      }
    }

    await batch.commit();
  } catch (e) {
    await deleteAuthUser(cred.user).catch(() => undefined);
    throw e instanceof Error ? e : new Error("Activation impossible");
  }

  return { role: invite.role };
}

export async function deleteInvitesForStructure(structureId: string): Promise<void> {
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, "invites"), where("structureId", "==", structureId)),
  );
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}
