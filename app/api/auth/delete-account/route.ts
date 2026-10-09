import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-server";
import { isAllowedSuperAdminEmail } from "@/lib/auth/super-admin";

type Body = {
  uid?: string;
  email?: string;
};

async function loadCaller(uid: string) {
  const snap = await getAdminDb().collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() ?? {};
  return {
    email: String(data.email ?? "").trim().toLowerCase(),
    role: String(data.role ?? ""),
    structureId: data.structureId ? String(data.structureId) : null,
  };
}

async function assertCanDeleteAuth(
  callerUid: string,
  target: { uid?: string; email?: string },
) {
  const caller = await loadCaller(callerUid);
  if (!caller) throw new Error("Profil appelant introuvable");

  const isSuper =
    caller.role === "super_admin" &&
    isAllowedSuperAdminEmail(caller.email);

  if (isSuper) return;

  if (caller.role !== "rh" || !caller.structureId) {
    throw new Error("Action réservée au RH ou au super admin");
  }

  const structureId = caller.structureId;

  if (target.uid) {
    const targetSnap = await getAdminDb()
      .collection("users")
      .doc(target.uid)
      .get();
    if (targetSnap.exists) {
      if (String(targetSnap.data()?.structureId ?? "") !== structureId) {
        throw new Error("Compte hors de votre structure");
      }
      return;
    }
  }

  if (target.email) {
    // firstLogin d'abord (ID = e-mail) — évite une requête composite sans index
    const firstLoginSnap = await getAdminDb()
      .collection("firstLogin")
      .doc(target.email)
      .get();
    if (
      firstLoginSnap.exists &&
      String(firstLoginSnap.data()?.structureId ?? "") === structureId
    ) {
      return;
    }

    // Un seul filtre égalité = index automatique ; filtrer la structure en mémoire
    const usersSnap = await getAdminDb()
      .collection("users")
      .where("email", "==", target.email)
      .limit(10)
      .get();
    if (
      usersSnap.docs.some(
        (d) => String(d.data()?.structureId ?? "") === structureId,
      )
    ) {
      return;
    }
  }

  throw new Error("Compte hors de votre structure");
}

async function deleteAuthTargets(uid?: string, email?: string) {
  const auth = getAdminAuth();
  const deleted: string[] = [];

  if (uid) {
    try {
      await auth.deleteUser(uid);
      deleted.push(uid);
    } catch (e) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code: string }).code)
          : "";
      if (code !== "auth/user-not-found") throw e;
    }
  }

  if (email) {
    try {
      const user = await auth.getUserByEmail(email);
      if (!deleted.includes(user.uid)) {
        await auth.deleteUser(user.uid);
        deleted.push(user.uid);
      }
    } catch (e) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code: string }).code)
          : "";
      if (code !== "auth/user-not-found") throw e;
    }
  }

  return deleted;
}

export async function POST(request: NextRequest) {
  try {
    const header = request.headers.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const body = (await request.json()) as Body;
    const uid = body.uid?.trim() || undefined;
    const email = body.email?.trim().toLowerCase() || undefined;

    if (!uid && !email) {
      return NextResponse.json(
        { error: "uid ou email requis" },
        { status: 400 },
      );
    }

    await assertCanDeleteAuth(decoded.uid, { uid, email });
    const deleted = await deleteAuthTargets(uid, email);

    return NextResponse.json({ ok: true, deleted });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Suppression Auth impossible";
    const lower = message.toLowerCase();
    const status =
      lower.includes("réservée") ||
      lower.includes("hors de") ||
      lower.includes("introuvable") ||
      lower.includes("non authentifié")
        ? 403
        : lower.includes("admin firebase non configuré")
          ? 503
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
