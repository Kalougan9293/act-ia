import type { Metadata } from "next";
import RhApp from "@/components/rh/RhApp";
import RequireAuth from "@/components/auth/RequireAuth";

export const metadata: Metadata = {
  title: "Espace RH — ConformAI",
  description: "Pilotage RH : collaborateurs, conformité AI Act & RGPD, attestations.",
};

export default function RhPage() {
  return (
    <RequireAuth roles={["rh"]}>
      <RhApp />
    </RequireAuth>
  );
}
