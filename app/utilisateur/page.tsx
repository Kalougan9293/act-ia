import type { Metadata } from "next";
import UserApp from "@/components/user/UserApp";
import RequireAuth from "@/components/auth/RequireAuth";

export const metadata: Metadata = {
  title: "Formation — ConformAI",
  description: "Espace collaborateur : parcours AI Act & RGPD.",
};

export default function UtilisateurPage() {
  return (
    <RequireAuth roles={["employee", "rh"]}>
      <UserApp />
    </RequireAuth>
  );
}
