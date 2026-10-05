import { createUserWithEmailAndPassword } from "firebase/auth";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { validatePassword } from "@/lib/auth/password";
import { isAllowedSuperAdminEmail } from "@/lib/auth/super-admin";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { logOut } from "@/lib/firebase/auth";

function authCode(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code: string }).code)
    : "";
}

/**
 * Première connexion : le RH (ou super admin) a préparé l'accès (firstLogin).
 * Sans création préalable → impossible. L'utilisateur choisit son mot de passe.
 */
export async function completeFirstConnection(
  emailRaw: string,
  password: string,
  options?: { structureId?: string },
) {
  const check = validatePassword(password);
  if (!check.ok) throw new Error(check.message ?? "Mot de passe invalide");

  const email = emailRaw.trim().toLowerCase();
  if (isAllowedSuperAdminEmail(email)) {
    throw new Error("Le super admin se connecte avec son mot de passe, sans première connexion.");
  }
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth || !db) throw new Error("Firebase non configuré");

  const pendingSnap = await getDoc(doc(db, "firstLogin", email));
  const pending = pendingSnap.data();
  if (!pendingSnap.exists() || pending?.status !== "pending") {
    throw new Error(
      "Aucun accès créé pour cet e-mail. Demandez à votre RH de vous ajouter.",
    );
  }
  if (
    options?.structureId &&
    String(pending.structureId ?? "") !== options.structureId
  ) {
    throw new Error("Cet e-mail n'est pas rattaché à cette entreprise.");
  }

  let created;
  try {
    created = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (authCode(error) === "auth/email-already-in-use") {
      throw new Error("Ce compte a déjà un mot de passe. Utilisez Se connecter.");
    }
    throw error instanceof Error ? error : new Error("Première connexion impossible");
  }

  try {
    await setDoc(doc(db, "users", created.user.uid), {
      email,
      name: String(pending.name ?? ""),
      role: pending.role,
      structureId: pending.structureId ?? null,
      status: "active",
      lastLoginAt: serverTimestamp(),
      createdAt: pending.createdAt ?? new Date().toISOString().slice(0, 10),
      progressPercent: pending.role === "employee" ? 0 : null,
      certificateId: null,
      certifiedAt: null,
      quizScore: null,
      // Siège déjà réservé à la création RH ; pas de +1 ici
      formationEnrolled: pending.role === "employee",
    });

    const legacyId = pending.legacyUserId ? String(pending.legacyUserId) : "";
    if (legacyId && legacyId !== created.user.uid) {
      await deleteDoc(doc(db, "users", legacyId)).catch(() => undefined);
    }
    await deleteDoc(doc(db, "firstLogin", email));
  } catch (error) {
    await logOut().catch(() => undefined);
    throw error instanceof Error ? error : new Error("Activation impossible");
  }
}
