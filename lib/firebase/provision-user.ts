import { doc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { saveUser } from "@/lib/firebase/admin-data";
import type { PlatformUser, UserRole } from "@/lib/admin/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Prépare un accès RH/collaborateur sans créer de mot de passe Auth.
 * La personne active son compte via « Première connexion ? ».
 */
export async function provisionTenantUser(params: {
  email: string;
  name: string;
  role: Exclude<UserRole, "super_admin">;
  structureId: string;
}): Promise<PlatformUser> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");

  const email = params.email.trim().toLowerCase();
  const provisionalId = `pending_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  const user: PlatformUser = {
    id: provisionalId,
    email,
    name: params.name.trim(),
    role: params.role,
    structureId: params.structureId,
    status: "invited",
    lastLoginAt: null,
    createdAt: todayIso(),
    progressPercent: params.role === "employee" ? 0 : null,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
  };

  await saveUser(user);

  await setDoc(doc(db, "firstLogin", email), {
    email,
    name: user.name,
    role: user.role,
    structureId: user.structureId,
    status: "pending",
    legacyUserId: provisionalId,
    createdAt: user.createdAt,
  });

  return user;
}
