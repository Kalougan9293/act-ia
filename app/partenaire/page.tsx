import type { Metadata } from "next";
import PartnerApp from "@/components/partner/PartnerApp";
import RequireAuth from "@/components/auth/RequireAuth";

export const metadata: Metadata = {
  title: "Espace partenaire — LockinIA",
  description: "Pilotage OF : entreprises clientes, quotas et suivi des parcours.",
};

export default function PartenairePage() {
  return (
    <RequireAuth roles={["partner"]}>
      <PartnerApp />
    </RequireAuth>
  );
}
