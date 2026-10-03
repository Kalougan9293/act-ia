"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from "@/lib/firebase/client";
import { logOut, signIn } from "@/lib/firebase/auth";
import type { UserRole } from "@/lib/admin/types";
import type { AppSession } from "@/lib/tenant/scope";
import { isAllowedSuperAdminEmail } from "@/lib/auth/super-admin";

export type AuthProfile = {
  email: string;
  name: string;
  role: UserRole;
  structureId: string | null;
  status: string;
};

type AuthContextValue = {
  ready: boolean;
  configured: boolean;
  user: User | null;
  profile: AuthProfile | null;
  /** Faux tant que le profil du compte connecté n'est pas chargé. */
  profileSettled: boolean;
  session: AppSession | null;
  error: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  bootstrapSuperAdmin: (params: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(uid: string): Promise<AuthProfile | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    email: String(data.email ?? ""),
    name: String(data.name ?? ""),
    role: data.role as UserRole,
    structureId: (data.structureId as string | null) ?? null,
    status: String(data.status ?? "active"),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [profileSettled, setProfileSettled] = useState(!configured);
  const [error, setError] = useState<string | null>(null);
  const settledUid = useRef<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const auth = getFirebaseAuth();
    const current = auth?.currentUser;
    if (!current) {
      setProfile(null);
      return;
    }
    const next = await loadProfile(current.uid);
    setProfile(next);
  }, []);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setReady(true);
      return;
    }
    let active = true;
    let request = 0;
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      const id = ++request;
      setUser(nextUser);
      setError(null);
      if (!nextUser) {
        settledUid.current = null;
        setProfile(null);
        setProfileSettled(true);
        setReady(true);
        return;
      }

      if (settledUid.current !== nextUser.uid) setProfileSettled(false);
      void (async () => {
        try {
          const nextProfile = await loadProfile(nextUser.uid);
          if (!active || id !== request) return;
          const email = nextUser.email || nextProfile?.email || "";
          if (
            nextProfile?.role === "super_admin" &&
            email &&
            !isAllowedSuperAdminEmail(email)
          ) {
            await logOut();
            if (!active || id !== request) return;
            settledUid.current = null;
            setUser(null);
            setProfile(null);
            setError("Accès super admin refusé");
          } else {
            settledUid.current = nextUser.uid;
            setProfile(nextProfile);
          }
        } catch (e) {
          if (!active || id !== request) return;
          settledUid.current = null;
          setProfile(null);
          setError(e instanceof Error ? e.message : "Profil introuvable");
        } finally {
          if (active && id === request) {
            setProfileSettled(true);
            setReady(true);
          }
        }
      })();
    });
    return () => {
      active = false;
      unsub();
    };
  }, [configured]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    await signIn(email.trim(), password);
  }, []);

  const bootstrapSuperAdmin = useCallback(
    async ({ email, password, name }: { email: string; password: string; name: string }) => {
      setError(null);
      if (!isAllowedSuperAdminEmail(email)) {
        throw new Error("Seul le propriétaire peut créer le compte super admin");
      }
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      if (!auth || !db) throw new Error("Firebase non configuré");

      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await setDoc(doc(db, "users", cred.user.uid), {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: "super_admin",
        structureId: null,
        status: "active",
        progressPercent: null,
        certificateId: null,
        certifiedAt: null,
        quizScore: null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      await setDoc(doc(db, "config", "initialized"), {
        at: serverTimestamp(),
        by: cred.user.uid,
      });

      const nextProfile = await loadProfile(cred.user.uid);
      setProfile(nextProfile);
    },
    [],
  );

  const signOutUser = useCallback(async () => {
    await logOut();
    settledUid.current = null;
    setProfile(null);
    setProfileSettled(true);
  }, []);

  const session: AppSession | null = useMemo(() => {
    if (!user || !profile) return null;
    return {
      uid: user.uid,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      structureId: profile.structureId,
    };
  }, [user, profile]);

  const value = useMemo(
    () => ({
      ready,
      configured,
      user,
      profile,
      profileSettled,
      session,
      error,
      signInWithPassword,
      bootstrapSuperAdmin,
      signOutUser,
      refreshProfile,
    }),
    [
      ready,
      configured,
      user,
      profile,
      profileSettled,
      session,
      error,
      signInWithPassword,
      bootstrapSuperAdmin,
      signOutUser,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
