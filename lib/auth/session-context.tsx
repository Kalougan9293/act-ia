"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_RH_SESSION,
  DEMO_USER_SESSION,
  type AppSession,
} from "@/lib/tenant/scope";

type SessionContextValue = {
  session: AppSession;
  setSession: (next: AppSession) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial: AppSession;
}) {
  const [session, setSession] = useState<AppSession>(initial);
  const value = useMemo(() => ({ session, setSession }), [session]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession doit être utilisé dans SessionProvider");
  return ctx;
}

export { DEMO_RH_SESSION, DEMO_USER_SESSION };
