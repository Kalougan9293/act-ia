import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import RequireAuth from "@/components/auth/RequireAuth";

export const metadata: Metadata = {
  title: "Admin — ConformAI",
  description: "Espace super admin : structures, comptes et facturation.",
};

export default function AdminPage() {
  return (
    <RequireAuth roles={["super_admin"]}>
      <AdminDashboard />
    </RequireAuth>
  );
}
