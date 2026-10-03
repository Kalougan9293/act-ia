import { createUserWithEmailAndPassword } from "firebase/auth";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { validatePassword } from "@/lib/auth/password";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { logOut } from "@/lib/firebase/auth";

function authCode(error: unknown) {
  return error && typeof error === "object" && "code" in error
    ? String((error as { code: string }).code)
    : "";
}

/**
 * Première connexion : le super admin a préparé l'accès (firstLogin).
 * L'utilisateur choisit son mot de passe — aucun mot de passe temporaire.
 */
export async function completeFirstConnection(emailRaw: string, password: string) {
  const check = validatePassword(password);
  if (!check.ok) throw new Error(check.message ?? "Mot de passe invalide");

  const email = emailRaw.trim().toLowerCase();
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  if (!auth || !db) throw new Error("Firebase non configuré");

  const pendingSnap = await getDoc(doc(db, "firstLogin", email));
  const pending = pendingSnap.data();
  if (!pendingSnap.exists() || pending?.status !== "pending") {
    throw new Error(
      "Aucun compte en attente pour cet e-mail. Demandez à votre administrateur de créer l'accès.",
    );
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
