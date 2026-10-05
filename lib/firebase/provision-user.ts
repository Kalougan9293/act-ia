import { doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { saveUser } from "@/lib/firebase/admin-data";
import { getStructureSeatStatus } from "@/lib/firebase/seats";
import { listUsersByStructure } from "@/lib/firebase/tenant-data";
import type { PlatformUser, UserRole } from "@/lib/admin/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Prépare un accès RH/collaborateur sans créer de mot de passe Auth.
 * La personne active son compte via « Première connexion ? » sur /connexion.
 *
 * Cas spécial : si l'e-mail est déjà celui du RH de la structure,
 * on l'inscrit à la formation (1 siège) au lieu de créer un doublon.
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
  const name = params.name.trim();
  if (!email || !name) throw new Error("Nom et e-mail requis");

  // RH existant avec le même e-mail → inscription formation (pas de 2e compte)
  if (params.role === "employee") {
    const members = await listUsersByStructure(params.structureId);
    const existingRh = members.find(
      (u) => u.role === "rh" && u.email.trim().toLowerCase() === email,
    );
    if (existingRh) {
      if (existingRh.formationEnrolled) {
        throw new Error("Ce compte RH est déjà inscrit à la formation.");
      }
      const seats = await getStructureSeatStatus(params.structureId);
      if (seats.full) {
        throw new Error(
          `Nombre d'accès atteint (${seats.seatsMax}). Supprimez un collaborateur pour en ajouter un.`,
        );
      }
      await updateDoc(doc(db, "users", existingRh.id), {
        name,
        formationEnrolled: true,
        progressPercent: existingRh.progressPercent ?? 0,
      });
      if (seats.inviteToken) {
        await updateDoc(doc(db, "structureInvites", seats.inviteToken), {
          seatsUsed: increment(1),
        });
      }
      return {
        ...existingRh,
        name,
        formationEnrolled: true,
        progressPercent: existingRh.progressPercent ?? 0,
      };
    }

    // E-mail déjà collaborateur actif
    const existingEmployee = members.find(
      (u) => u.role === "employee" && u.email.trim().toLowerCase() === email,
    );
    if (existingEmployee) {
      throw new Error("Ce collaborateur est déjà dans la liste.");
    }
  }

  const existingLogin = await getDoc(doc(db, "firstLogin", email));
  if (existingLogin.exists() && existingLogin.data()?.status === "pending") {
    throw new Error("Un accès est déjà en attente pour cet e-mail.");
  }

  if (params.role === "employee") {
    const seats = await getStructureSeatStatus(params.structureId);
    if (seats.full) {
      throw new Error(
        `Nombre d'accès atteint (${seats.seatsMax}). Supprimez un collaborateur pour en ajouter un.`,
      );
    }
  }

  const provisionalId = `pending_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  const user: PlatformUser = {
    id: provisionalId,
    email,
    name,
    role: params.role,
    structureId: params.structureId,
    status: "invited",
    lastLoginAt: null,
    createdAt: todayIso(),
    progressPercent: params.role === "employee" ? 0 : null,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
    formationEnrolled: params.role === "employee",
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

  // Réserve 1 siège dès la création RH (libéré si suppression avant activation)
  if (params.role === "employee") {
    const seats = await getStructureSeatStatus(params.structureId);
    if (seats.inviteToken) {
      await updateDoc(doc(db, "structureInvites", seats.inviteToken), {
        seatsUsed: increment(1),
      });
    }
  }

  return user;
}
