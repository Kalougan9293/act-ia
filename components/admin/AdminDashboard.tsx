"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Archive,
  Award,
  Building2,
  Download,
  GraduationCap,
  FileText,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AdminCertificatePreview from "@/components/admin/AdminCertificatePreview";
import {
  attestationsCsv,
  downloadAdminReportZip,
  downloadCsv,
  structuresCsv,
  usersCsv,
} from "@/lib/admin/export-csv";
import { formatDate } from "@/lib/admin/format";
import { openStructureInvoice } from "@/lib/admin/invoice";
import { structureGraduates } from "@/lib/admin/stats";
import {
  PLAN_PRICES,
  PLAN_SEATS,
  emptyCompanyModule,
  type PlanId,
  type PlatformUser,
  type Structure,
  type StructureFormValues,
} from "@/lib/admin/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  deleteStructureAndUsers,
  deleteUser,
  listStructures,
  listUsers,
  saveStructure,
  saveUser,
} from "@/lib/firebase/admin-data";
import { getFirebaseDb } from "@/lib/firebase/client";
import { syncStructureInviteSeats } from "@/lib/firebase/seats";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  deleteInviteByToken,
  deleteInvitesForStructure,
  inviteToPlatformUser,
  listPendingInvites,
} from "@/lib/firebase/invites";
import { provisionTenantUser } from "@/lib/firebase/provision-user";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Facturation annuelle : +1 an par rapport à la date de création */
function billingDateFromCreation(createdAt: string) {
  const [y, m, d] = createdAt.split("-").map(Number);
  if (!y || !m || !d) return createdAt;
  return `${y + 1}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Parse JJ/MM/AAAA → ISO, sinon null */
function parseFrDate(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return `${y}-${m}-${d}`;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-sm text-center";

function CenteredDateField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
}) {
  const [text, setText] = useState(formatDate(value));

  useEffect(() => {
    setText(formatDate(value));
  }, [value]);

  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        required={required}
        placeholder="JJ/MM/AAAA"
        value={text === "—" ? "" : text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          const iso = parseFrDate(next);
          if (iso) onChange(iso);
        }}
        onBlur={() => {
          const iso = parseFrDate(text);
          if (iso) {
            onChange(iso);
            setText(formatDate(iso));
          } else {
            setText(formatDate(value));
          }
        }}
        className={inputClass}
      />
    </label>
  );
}

const emptyForm = (): StructureFormValues => {
  const createdAt = todayIso();
  return {
    name: "",
    siret: "",
    billingEmail: "",
    address: "",
    plan: "starter",
    seats: 5,
    rhName: "",
    rhEmail: "",
    phone: "",
    createdAt,
    nextInvoiceAt: billingDateFromCreation(createdAt),
  };
};

type ModalMode = "create" | "edit";
type SortKey = "name" | "email" | "graduates" | "createdAt" | "nextInvoiceAt";

function isoDateValue(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return 0;
  return new Date(y, m - 1, d).getTime();
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className="px-2 py-1.5 font-medium">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-1 whitespace-nowrap text-xs ${
          active
            ? "text-blue-700 dark:text-blue-300"
            : "hover:text-slate-800 dark:hover:text-slate-200"
        }`}
      >
        {label}
        <Icon className="h-3 w-3 shrink-0" />
      </button>
    </th>
  );
}

function structureEmail(structure: Structure, users: PlatformUser[]) {
  const rh = users.find((u) => u.structureId === structure.id && u.role === "rh");
  return rh?.email || structure.billing.billingEmail || "—";
}

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, signOutUser } = useAuth();
  const [structures, setStructures] = useState<Structure[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "name",
    dir: "asc",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StructureFormValues>(emptyForm());
  const [view, setView] = useState<"active" | "archived" | "users" | "attestations">(
    "active",
  );
  const [graduatesStructureId, setGraduatesStructureId] = useState<string | null>(null);
  const [previewCertificateUser, setPreviewCertificateUser] =
    useState<PlatformUser | null>(null);
  const [structureQuery, setStructureQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [attestationQuery, setAttestationQuery] = useState("");
  const [attestationPage, setAttestationPage] = useState(0);
  const [userSort, setUserSort] = useState<{
    key: "name" | "company" | "progress" | "satisfaction" | "lastLogin";
    dir: "asc" | "desc";
  }>({ key: "name", dir: "asc" });
  const [attestationSort, setAttestationSort] = useState<{
    key: "name" | "email" | "company" | "certificate" | "certifiedAt";
    dir: "asc" | "desc";
  }>({ key: "certifiedAt", dir: "desc" });

  const ATTESTATIONS_PAGE_SIZE = 20;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [nextStructures, nextUsers, pendingInvites] = await Promise.all([
          listStructures(),
          listUsers(),
          listPendingInvites(),
        ]);
        if (!cancelled) {
          setStructures(nextStructures);
          // Invitations perso collaborateur abandonnées — on ne les compte plus.
          // Seules les invitations RH pending restent visibles si besoin.
          const inviteUsers = pendingInvites
            .filter((invite) => invite.role === "rh")
            .map(inviteToPlatformUser);
          const emailsWithAuth = new Set(
            nextUsers.map((u) => u.email.trim().toLowerCase()),
          );
          setUsers([
            ...nextUsers,
            ...inviteUsers.filter(
              (u) => !emailsWithAuth.has(u.email.trim().toLowerCase()),
            ),
          ]);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Chargement impossible");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeStructures = useMemo(
    () => structures.filter((s) => !s.archivedAt),
    [structures],
  );
  const archivedStructures = useMemo(
    () => structures.filter((s) => !!s.archivedAt),
    [structures],
  );
  const activeStructureIds = useMemo(
    () => new Set(activeStructures.map((s) => s.id)),
    [activeStructures],
  );

  /** Utilisateurs formation : collaborateurs + RH inscrits via le lien. */
  const isFormationUser = (u: PlatformUser) =>
    u.role === "employee" || (u.role === "rh" && Boolean(u.formationEnrolled));

  const totalUsers = users.filter(
    (u) =>
      isFormationUser(u) &&
      (!u.structureId || activeStructureIds.has(u.structureId)),
  ).length;
  const graduatedUsers = users.filter(
    (u) =>
      isFormationUser(u) &&
      u.progressPercent === 100 &&
      (!u.structureId || activeStructureIds.has(u.structureId)),
  ).length;

  const graduatesStructure =
    structures.find((s) => s.id === graduatesStructureId) ?? null;
  const graduatesMembers = useMemo(() => {
    if (!graduatesStructureId) return [];
    return users
      .filter(
        (u) =>
          u.structureId === graduatesStructureId &&
          (u.role === "employee" || (u.role === "rh" && u.formationEnrolled)),
      )
      .sort((a, b) => {
        const aDone = a.progressPercent === 100 ? 0 : 1;
        const bDone = b.progressPercent === 100 ? 0 : 1;
        return aDone - bDone || a.name.localeCompare(b.name, "fr");
      });
  }, [graduatesStructureId, users]);

  const structureNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of structures) map.set(s.id, s.name);
    return map;
  }, [structures]);

  const filtered = useMemo(() => {
    const source = view === "archived" ? archivedStructures : activeStructures;
    const q = structureQuery.trim().toLowerCase();
    const list = q
      ? source.filter((s) => {
          const email = structureEmail(s, users).toLowerCase();
          return (
            s.name.toLowerCase().includes(q) ||
            email.includes(q) ||
            s.billing.billingEmail.toLowerCase().includes(q) ||
            s.billing.siret.toLowerCase().includes(q)
          );
        })
      : source;
    return [...list].sort((a, b) => {
      let result = 0;
      if (sort.key === "name") result = a.name.localeCompare(b.name, "fr");
      else if (sort.key === "email") {
        result = structureEmail(a, users).localeCompare(structureEmail(b, users), "fr");
      } else if (sort.key === "graduates") {
        const ga = structureGraduates(a.id, users);
        const gb = structureGraduates(b.id, users);
        result = ga.graduated - gb.graduated || ga.total - gb.total;
      } else if (sort.key === "createdAt") {
        result = isoDateValue(a.createdAt) - isoDateValue(b.createdAt);
      } else {
        result =
          isoDateValue(a.billing.nextInvoiceAt) - isoDateValue(b.billing.nextInvoiceAt);
      }
      return sort.dir === "asc" ? result : -result;
    });
  }, [activeStructures, archivedStructures, users, sort, view, structureQuery]);

  const allPlatformUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    const list = users.filter((u) => {
      if (
        !(u.role === "employee" || (u.role === "rh" && u.formationEnrolled)) ||
        (u.structureId && !activeStructureIds.has(u.structureId))
      ) {
        return false;
      }
      if (!q) return true;
      const company = u.structureId
        ? structureNameById.get(u.structureId) ?? ""
        : "";
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        (u.certificateId ?? "").toLowerCase().includes(q)
      );
    });
    return [...list].sort((a, b) => {
      const companyA = a.structureId
        ? structureNameById.get(a.structureId) ?? "—"
        : "—";
      const companyB = b.structureId
        ? structureNameById.get(b.structureId) ?? "—"
        : "—";
      let result = 0;
      if (userSort.key === "name") result = a.name.localeCompare(b.name, "fr");
      else if (userSort.key === "company") result = companyA.localeCompare(companyB, "fr");
      else if (userSort.key === "progress") {
        result = (a.progressPercent ?? -1) - (b.progressPercent ?? -1);
      } else if (userSort.key === "satisfaction") {
        result = (a.satisfactionRating ?? -1) - (b.satisfactionRating ?? -1);
      } else {
        result = isoDateValue(a.lastLoginAt ?? "") - isoDateValue(b.lastLoginAt ?? "");
      }
      return userSort.dir === "asc" ? result : -result;
    });
  }, [users, activeStructureIds, structureNameById, userSort, userQuery]);

  const allAttestations = useMemo(() => {
    return users.filter(
      (u) =>
        isFormationUser(u) &&
        u.progressPercent === 100 &&
        (!u.structureId || activeStructureIds.has(u.structureId)),
    );
  }, [users, activeStructureIds]);

  const filteredAttestations = useMemo(() => {
    const q = attestationQuery.trim().toLowerCase();
    const list = q
      ? allAttestations.filter((u) => {
          const company = u.structureId
            ? structureNameById.get(u.structureId) ?? ""
            : "";
          return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            company.toLowerCase().includes(q) ||
            (u.certificateId ?? "").toLowerCase().includes(q)
          );
        })
      : allAttestations;
    return [...list].sort((a, b) => {
      const companyA = a.structureId
        ? structureNameById.get(a.structureId) ?? "—"
        : "—";
      const companyB = b.structureId
        ? structureNameById.get(b.structureId) ?? "—"
        : "—";
      let result = 0;
      if (attestationSort.key === "name") {
        result = a.name.localeCompare(b.name, "fr");
      } else if (attestationSort.key === "email") {
        result = a.email.localeCompare(b.email, "fr");
      } else if (attestationSort.key === "company") {
        result = companyA.localeCompare(companyB, "fr");
      } else if (attestationSort.key === "certificate") {
        result = (a.certificateId ?? "").localeCompare(b.certificateId ?? "", "fr");
      } else {
        result =
          isoDateValue(a.certifiedAt ?? "") - isoDateValue(b.certifiedAt ?? "");
      }
      if (result === 0) result = a.name.localeCompare(b.name, "fr");
      return attestationSort.dir === "asc" ? result : -result;
    });
  }, [allAttestations, attestationQuery, structureNameById, attestationSort]);

  const attestationPageCount = Math.max(
    1,
    Math.ceil(filteredAttestations.length / ATTESTATIONS_PAGE_SIZE),
  );
  const attestationPageSafe = Math.min(attestationPage, attestationPageCount - 1);
  const pagedAttestations = filteredAttestations.slice(
    attestationPageSafe * ATTESTATIONS_PAGE_SIZE,
    attestationPageSafe * ATTESTATIONS_PAGE_SIZE + ATTESTATIONS_PAGE_SIZE,
  );

  function toggleUserSort(
    key: "name" | "company" | "progress" | "satisfaction" | "lastLogin",
  ) {
    setUserSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  function toggleAttestationSort(
    key: "name" | "email" | "company" | "certificate" | "certifiedAt",
  ) {
    setAttestationSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "certifiedAt" ? "desc" : "asc" },
    );
    setAttestationPage(0);
  }

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  function openCreate() {
    setModalMode("create");
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(structure: Structure) {
    const rh = users.find((u) => u.structureId === structure.id && u.role === "rh");
    setModalMode("edit");
    setEditingId(structure.id);
    setForm({
      name: structure.name,
      siret: structure.billing.siret,
      billingEmail: structure.billing.billingEmail,
      address: structure.billing.address,
      plan: structure.billing.plan,
      seats: Math.max(1, Number(structure.billing.seats) || PLAN_SEATS[structure.billing.plan]),
      rhName: rh?.name ?? "",
      rhEmail: rh?.email ?? structure.billing.billingEmail,
      phone: structure.billing.phone,
      createdAt: structure.createdAt,
      nextInvoiceAt: structure.billing.nextInvoiceAt,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.rhEmail.trim() || saving) return;

    const seats =
      form.plan === "enterprise"
        ? Math.max(PLAN_SEATS.enterprise, Number(form.seats) || PLAN_SEATS.enterprise)
        : Math.min(
            PLAN_SEATS[form.plan],
            Math.max(1, Number(form.seats) || PLAN_SEATS[form.plan]),
          );
    const price = form.plan === "enterprise" ? 0 : PLAN_PRICES[form.plan];
    const createdAt = form.createdAt || todayIso();
    const nextInvoiceAt = form.nextInvoiceAt || billingDateFromCreation(createdAt);
    const email = form.rhEmail.trim().toLowerCase();
    const rhName = form.rhName.trim() || form.name.trim();

    setSaving(true);
    setLoadError(null);
    try {
      if (modalMode === "create") {
        const id = `str_${crypto.randomUUID().slice(0, 8)}`;
        const inviteToken = crypto.randomUUID().replace(/-/g, "");
        const structure: Structure = {
          id,
          name: form.name.trim(),
          createdAt,
          status: "active",
          archivedAt: null,
          inviteToken,
          companyModule: emptyCompanyModule(),
          billing: {
            companyName: form.name.trim(),
            siret: form.siret.trim(),
            billingEmail: form.billingEmail.trim() || email,
            address: form.address.trim(),
            phone: form.phone.trim(),
            plan: form.plan,
            seats,
            priceMonthlyEur: price,
            nextInvoiceAt,
          },
        };
        await saveStructure(structure);
        const db = getFirebaseDb();
        if (db) {
          await setDoc(doc(db, "structureInvites", inviteToken), {
            structureId: id,
            name: structure.name,
            seatsMax: seats,
            seatsUsed: 0,
            createdAt: serverTimestamp(),
          });
        }
        const rh = await provisionTenantUser({
          email,
          name: rhName,
          role: "rh",
          structureId: id,
        });
        setStructures((current) => [structure, ...current]);
        setUsers((current) => [rh, ...current]);
        closeModal();
      } else if (editingId) {
        const current = structures.find((s) => s.id === editingId);
        if (!current) return;
        const structure: Structure = {
          ...current,
          name: form.name.trim(),
          createdAt,
          billing: {
            ...current.billing,
            companyName: form.name.trim(),
            siret: form.siret.trim(),
            billingEmail: form.billingEmail.trim() || email,
            address: form.address.trim(),
            phone: form.phone.trim(),
            plan: form.plan,
            seats,
            priceMonthlyEur: price,
            nextInvoiceAt,
          },
        };
        await saveStructure(structure);
        await syncStructureInviteSeats(structure, { recountUsed: true }).catch(() => undefined);

        const existingRh = users.find(
          (u) => u.structureId === editingId && u.role === "rh",
        );
        const emailChanged =
          !existingRh || existingRh.email.trim().toLowerCase() !== email;
        const needsAuth =
          !existingRh ||
          existingRh.id.startsWith("invite:") ||
          existingRh.id.startsWith("usr_") ||
          existingRh.id.startsWith("pending_") ||
          existingRh.status === "invited";

        let rh: PlatformUser;
        if (!existingRh || emailChanged || needsAuth) {
          if (existingRh && !existingRh.id.startsWith("invite:")) {
            try {
              await deleteUser(existingRh.id);
            } catch {
              /* ignore */
            }
          }
          rh = await provisionTenantUser({
            email,
            name: rhName,
            role: "rh",
            structureId: editingId,
          });
        } else {
          rh = { ...existingRh, name: rhName, email };
          await saveUser(rh);
        }

        setStructures((list) => list.map((s) => (s.id === editingId ? structure : s)));
        setUsers((list) => {
          const withoutOldRh = list.filter(
            (u) => !(u.structureId === editingId && u.role === "rh"),
          );
          return [rh, ...withoutOldRh];
        });
        closeModal();
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function archiveStructure(structure: Structure) {
    const next = { ...structure, archivedAt: todayIso() };
    setStructures((current) =>
      current.map((s) => (s.id === structure.id ? next : s)),
    );
    try {
      await saveStructure(next);
    } catch (e) {
      setStructures((current) =>
        current.map((s) => (s.id === structure.id ? structure : s)),
      );
      setLoadError(e instanceof Error ? e.message : "Archivage impossible");
    }
  }

  async function restoreStructure(structure: Structure) {
    const next = { ...structure, archivedAt: null };
    setStructures((current) =>
      current.map((s) => (s.id === structure.id ? next : s)),
    );
    try {
      await saveStructure(next);
    } catch (e) {
      setStructures((current) =>
        current.map((s) => (s.id === structure.id ? structure : s)),
      );
      setLoadError(e instanceof Error ? e.message : "Restauration impossible");
    }
  }

  async function deleteStructureForever(structure: Structure) {
    const ok = window.confirm(
      `Supprimer définitivement « ${structure.name} » et tous les comptes liés ? Irréversible.`,
    );
    if (!ok) return;
    const linked = users.filter(
      (u) => u.structureId === structure.id && !u.id.startsWith("invite:"),
    );
    try {
      await deleteInvitesForStructure(structure.id);
      await deleteStructureAndUsers(
        structure.id,
        linked.map((u) => u.id),
      );
      setStructures((current) => current.filter((s) => s.id !== structure.id));
      setUsers((current) => current.filter((u) => u.structureId !== structure.id));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  async function deletePlatformUser(user: PlatformUser) {
    const ok = window.confirm(
      `Supprimer définitivement « ${user.name} » (${user.email}) ? Irréversible.`,
    );
    if (!ok) return;
    try {
      if (user.id.startsWith("invite:")) {
        await deleteInviteByToken(user.id.slice("invite:".length));
      } else {
        await deleteUser(user.id);
      }
      setUsers((current) => current.filter((u) => u.id !== user.id));
      if (user.structureId) {
        const structure = structures.find((s) => s.id === user.structureId);
        if (structure) {
          await syncStructureInviteSeats(structure, { recountUsed: true }).catch(
            () => undefined,
          );
        }
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  function exportCurrentViewCsv() {
    const day = new Date().toISOString().slice(0, 10);
    if (view === "users") {
      downloadCsv(`utilisateurs-${day}.csv`, usersCsv(allPlatformUsers, structures));
      return;
    }
    if (view === "attestations") {
      downloadCsv(
        `attestations-${day}.csv`,
        attestationsCsv(filteredAttestations, structures),
      );
      return;
    }
    if (view === "archived") {
      downloadCsv(
        `structures-archivees-${day}.csv`,
        structuresCsv(filtered, users),
      );
      return;
    }
    downloadCsv(`structures-actives-${day}.csv`, structuresCsv(filtered, users));
  }

  function exportFullReport() {
    const formationUsers = users.filter(
      (u) =>
        isFormationUser(u) &&
        (!u.structureId || activeStructureIds.has(u.structureId)),
    );
    const graduated = formationUsers.filter((u) => u.progressPercent === 100);
    downloadAdminReportZip({
      activeStructures,
      archivedStructures,
      users,
      formationUsers,
      graduatedUsers: graduated,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <a href="/" className="flex items-center gap-1.5 font-bold text-base tracking-tight">
              Start<span className="text-blue-600 dark:text-blue-400">IA</span>
              <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </a>
            <span className="hidden sm:inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              Super admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400">
              {profile?.email ?? "—"}
            </span>
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                router.replace("/connexion?next=/admin");
              }}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600"
            >
              Déconnexion
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-3 text-center">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
          <h1 className="text-xl font-bold tracking-tight">Pilotage plateforme</h1>
          <button
            type="button"
            onClick={openCreate}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
          <button
            type="button"
            onClick={exportCurrentViewCsv}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Exporter la vue affichée en CSV"
          >
            <Download className="h-4 w-4" />
            CSV (vue)
          </button>
          <button
            type="button"
            onClick={exportFullReport}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-950/70"
            title="Rapport complet : 4 CSV dans un ZIP"
          >
            <Download className="h-4 w-4" />
            Rapport complet (ZIP)
          </button>
        </div>

        {loadError && (
          <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
        )}
        {loading && (
          <p className="text-sm text-slate-500">Chargement Firestore…</p>
        )}

        <div className="mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl">
          <button
            type="button"
            onClick={() => {
              setView("active");
              setStructureQuery("");
            }}
            className={`rounded-lg border px-3 py-2.5 shadow-sm transition-colors ${
              view === "active"
                ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Structures
            </div>
            <div className="mt-0.5 text-2xl font-bold tabular-nums">{activeStructures.length}</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setView("users");
              setUserQuery("");
            }}
            className={`rounded-lg border px-3 py-2.5 shadow-sm transition-colors ${
              view === "users"
                ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
              <Users className="h-3.5 w-3.5" />
              Utilisateurs
            </div>
            <div className="mt-0.5 text-2xl font-bold tabular-nums">{totalUsers}</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setView("attestations");
              setAttestationPage(0);
            }}
            className={`rounded-lg border px-3 py-2.5 shadow-sm transition-colors ${
              view === "attestations"
                ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
              <Award className="h-3.5 w-3.5" />
              Attestations
            </div>
            <div className="mt-0.5 text-2xl font-bold tabular-nums">
              {graduatedUsers}
              <span className="text-sm font-semibold text-slate-400">/{totalUsers}</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setView("archived");
              setStructureQuery("");
            }}
            className={`rounded-lg border px-3 py-2.5 shadow-sm transition-colors ${
              view === "archived"
                ? "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
              <Archive className="h-3.5 w-3.5" />
              Archivés
            </div>
            <div className="mt-0.5 text-2xl font-bold tabular-nums">{archivedStructures.length}</div>
          </button>
        </div>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {view === "users" ? (
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2.5">
              <div className="relative mx-auto max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Nom, e-mail, entreprise ou n° attestation"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-center placeholder:text-slate-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {allPlatformUsers.length} utilisateur
                {allPlatformUsers.length !== 1 ? "s" : ""}
                {userQuery.trim() ? " trouvé(s)" : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm text-center">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <SortHeader
                    label="Utilisateur"
                    active={userSort.key === "name"}
                    dir={userSort.dir}
                    onClick={() => toggleUserSort("name")}
                  />
                  <th className="px-2 py-1.5 font-medium text-xs">E-mail</th>
                  <SortHeader
                    label="Entreprise"
                    active={userSort.key === "company"}
                    dir={userSort.dir}
                    onClick={() => toggleUserSort("company")}
                  />
                  <SortHeader
                    label="%"
                    active={userSort.key === "progress"}
                    dir={userSort.dir}
                    onClick={() => toggleUserSort("progress")}
                  />
                  <th className="px-2 py-1.5 font-medium text-xs" title="Positionnement → QCM">
                    Avant/Après
                  </th>
                  <SortHeader
                    label="Sat."
                    active={userSort.key === "satisfaction"}
                    dir={userSort.dir}
                    onClick={() => toggleUserSort("satisfaction")}
                  />
                  <th className="px-2 py-1.5 font-medium text-xs">Réclamation</th>
                  <th className="px-2 py-1.5 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {allPlatformUsers.map((user) => {
                  const company = user.structureId
                    ? structureNameById.get(user.structureId) ?? "—"
                    : "—";
                  const before =
                    user.positioningScore != null ? `${user.positioningScore}` : "—";
                  const after = user.quizScore != null ? `${user.quizScore}` : "—";
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="px-2 py-1.5 font-medium truncate" title={user.name}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!user.id.startsWith("invite:")) {
                              router.push(`/admin/candidats/${user.id}`);
                            }
                          }}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="px-2 py-1.5 truncate text-xs sm:text-sm" title={user.email}>
                        {user.email}
                      </td>
                      <td className="px-2 py-1.5 truncate text-xs sm:text-sm" title={company}>
                        {company}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums">
                        {user.role === "employee" || user.formationEnrolled
                          ? `${user.progressPercent ?? 0} %`
                          : "—"}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums text-xs">
                        {before} → {after}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums text-xs">
                        {user.satisfactionRating != null
                          ? `${user.satisfactionRating}/5`
                          : "—"}
                      </td>
                      <td
                        className="px-2 py-1.5 truncate text-xs"
                        title={user.satisfactionComplaint ?? undefined}
                      >
                        {user.satisfactionComplaint ? (
                          <span className="font-semibold text-amber-700 dark:text-amber-300">
                            Oui
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          aria-label="Supprimer définitivement"
                          title="Supprimer définitivement"
                          onClick={() => deletePlatformUser(user)}
                          className="rounded-md p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {allPlatformUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-sm text-slate-500">
                      {userQuery.trim()
                        ? "Aucun utilisateur trouvé"
                        : "Aucun utilisateur"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
          ) : view === "attestations" ? (
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2.5">
              <div className="relative mx-auto max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={attestationQuery}
                  onChange={(e) => {
                    setAttestationQuery(e.target.value);
                    setAttestationPage(0);
                  }}
                  placeholder="Nom, e-mail, entreprise ou n° attestation"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-center placeholder:text-slate-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {filteredAttestations.length} attestation
                {filteredAttestations.length !== 1 ? "s" : ""}
                {attestationQuery.trim() ? " trouvée(s)" : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm text-center">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[22%]" />
                  <col className="w-[18%]" />
                  <col className="w-[22%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead className="text-slate-500 dark:text-slate-400">
                  <tr>
                    <SortHeader
                      label="Utilisateur"
                      active={attestationSort.key === "name"}
                      dir={attestationSort.dir}
                      onClick={() => toggleAttestationSort("name")}
                    />
                    <SortHeader
                      label="E-mail"
                      active={attestationSort.key === "email"}
                      dir={attestationSort.dir}
                      onClick={() => toggleAttestationSort("email")}
                    />
                    <SortHeader
                      label="Entreprise"
                      active={attestationSort.key === "company"}
                      dir={attestationSort.dir}
                      onClick={() => toggleAttestationSort("company")}
                    />
                    <SortHeader
                      label="N° attestation"
                      active={attestationSort.key === "certificate"}
                      dir={attestationSort.dir}
                      onClick={() => toggleAttestationSort("certificate")}
                    />
                    <SortHeader
                      label="Émise le"
                      active={attestationSort.key === "certifiedAt"}
                      dir={attestationSort.dir}
                      onClick={() => toggleAttestationSort("certifiedAt")}
                    />
                  </tr>
                </thead>
                <tbody>
                  {pagedAttestations.map((user) => {
                    const company = user.structureId
                      ? structureNameById.get(user.structureId) ?? "—"
                      : "—";
                    return (
                      <tr
                        key={user.id}
                        className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-2 py-1.5 font-medium truncate" title={user.name}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!user.id.startsWith("invite:")) {
                                router.push(`/admin/candidats/${user.id}`);
                              }
                            }}
                            className="hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {user.name}
                          </button>
                        </td>
                        <td
                          className="px-2 py-1.5 truncate text-xs sm:text-sm"
                          title={user.email}
                        >
                          {user.email}
                        </td>
                        <td
                          className="px-2 py-1.5 truncate text-xs sm:text-sm"
                          title={company}
                        >
                          {company}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-[11px] truncate">
                          {user.certificateId ? (
                            <button
                              type="button"
                              onClick={() => setPreviewCertificateUser(user)}
                              className="text-blue-600 hover:underline dark:text-blue-400"
                              title="Voir l'attestation"
                            >
                              {user.certificateId}
                            </button>
                          ) : (
                            <span className="text-slate-400">Non émise</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                          {user.certifiedAt ? formatDate(user.certifiedAt) : "—"}
                          {user.quizScore != null ? ` · ${user.quizScore} %` : ""}
                        </td>
                      </tr>
                    );
                  })}
                  {pagedAttestations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-sm text-slate-500">
                        {attestationQuery.trim()
                          ? "Aucune attestation trouvée"
                          : "Aucune attestation"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredAttestations.length > ATTESTATIONS_PAGE_SIZE && (
              <div className="flex items-center justify-center gap-3 border-t border-slate-100 dark:border-slate-800 px-3 py-2.5">
                <button
                  type="button"
                  disabled={attestationPageSafe <= 0}
                  onClick={() => setAttestationPage(Math.max(0, attestationPageSafe - 1))}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Précédent
                </button>
                <span className="text-xs tabular-nums text-slate-500">
                  Page {attestationPageSafe + 1} / {attestationPageCount}
                </span>
                <button
                  type="button"
                  disabled={attestationPageSafe >= attestationPageCount - 1}
                  onClick={() =>
                    setAttestationPage(
                      Math.min(attestationPageCount - 1, attestationPageSafe + 1),
                    )
                  }
                  className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
          ) : (
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2.5">
              <div className="relative mx-auto max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={structureQuery}
                  onChange={(e) => setStructureQuery(e.target.value)}
                  placeholder="Nom, e-mail ou SIRET"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-center placeholder:text-slate-400"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {filtered.length} structure{filtered.length !== 1 ? "s" : ""}
                {structureQuery.trim() ? " trouvée(s)" : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm text-center">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[26%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="text-slate-500 dark:text-slate-400">
                <tr>
                  <SortHeader
                    label="Structure"
                    active={sort.key === "name"}
                    dir={sort.dir}
                    onClick={() => toggleSort("name")}
                  />
                  <SortHeader
                    label="Mail"
                    active={sort.key === "email"}
                    dir={sort.dir}
                    onClick={() => toggleSort("email")}
                  />
                  <SortHeader
                    label="Attestations"
                    active={sort.key === "graduates"}
                    dir={sort.dir}
                    onClick={() => toggleSort("graduates")}
                  />
                  <SortHeader
                    label="Création"
                    active={sort.key === "createdAt"}
                    dir={sort.dir}
                    onClick={() => toggleSort("createdAt")}
                  />
                  <SortHeader
                    label="Facturation"
                    active={sort.key === "nextInvoiceAt"}
                    dir={sort.dir}
                    onClick={() => toggleSort("nextInvoiceAt")}
                  />
                  <th className="px-2 py-1.5 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((structure) => {
                  const grads = structureGraduates(structure.id, users);
                  return (
                  <tr
                    key={structure.id}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-2 py-1.5 font-medium truncate" title={structure.name}>
                      {structure.name}
                    </td>
                    <td
                      className="px-2 py-1.5 truncate text-xs sm:text-sm"
                      title={structureEmail(structure, users)}
                    >
                      {structureEmail(structure, users)}
                    </td>
                    <td className="px-2 py-1.5 tabular-nums">
                      <button
                        type="button"
                        onClick={() => setGraduatesStructureId(structure.id)}
                        className="rounded-md px-1.5 py-0.5 font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        title="Formés / utilisateurs (collaborateurs) / capacité offre"
                      >
                        {grads.graduated}
                        <span className="font-normal text-emerald-600 dark:text-emerald-400">
                          /{grads.total}
                        </span>
                        <span className="text-slate-400 font-normal">
                          /{structure.billing.seats}
                        </span>
                      </button>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                      {formatDate(structure.createdAt)}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                      {formatDate(structure.billing.nextInvoiceAt)}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center justify-center gap-0.5">
                        {view === "active" ? (
                          <>
                            <button
                              type="button"
                              aria-label="Générer la facture"
                              title="Générer la facture"
                              onClick={() => {
                                const opened = openStructureInvoice(structure);
                                if (!opened) {
                                  setLoadError("Le navigateur a bloqué la facture. Autorisez les fenêtres.");
                                }
                              }}
                              className="rounded-md p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Modifier"
                              onClick={() => openEdit(structure)}
                              className="rounded-md p-1 text-slate-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Archiver"
                              onClick={() => archiveStructure(structure)}
                              className="rounded-md p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              aria-label="Restaurer"
                              onClick={() => restoreStructure(structure)}
                              className="rounded-md p-1 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Supprimer définitivement"
                              onClick={() => deleteStructureForever(structure)}
                              className="rounded-md p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-slate-500">
                      {structureQuery.trim()
                        ? "Aucune structure trouvée"
                        : view === "archived"
                          ? "Aucune structure archivée"
                          : "Aucune structure trouvée"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
          )}
        </section>
      </main>

      {previewCertificateUser && (
        <AdminCertificatePreview
          user={previewCertificateUser}
          structure={
            previewCertificateUser.structureId
              ? structures.find((s) => s.id === previewCertificateUser.structureId) ??
                null
              : null
          }
          onClose={() => setPreviewCertificateUser(null)}
        />
      )}

      {graduatesStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="graduates-modal-title"
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl text-center"
          >
            <div className="sticky top-0 z-10 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 relative">
              <h2 id="graduates-modal-title" className="text-sm font-semibold">
                Attestations de suivi — {graduatesStructure.name}
              </h2>
              <button
                type="button"
                onClick={() => setGraduatesStructureId(null)}
                aria-label="Fermer"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-left">
              {graduatesMembers.map((user) => {
                const done = user.progressPercent === 100 && !!user.certificateId;
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/candidats/${user.id}`)}
                      className="w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-center"
                    >
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      {done ? (
                        <div className="mt-1 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                          {user.certificateId}
                          {user.quizScore != null ? ` · ${user.quizScore} %` : ""}
                          {user.certifiedAt
                            ? ` · ${formatDate(user.certifiedAt)}`
                            : ""}
                        </div>
                      ) : (
                        <div className="mt-1 text-[11px] text-slate-400">
                          {user.progressPercent ?? 0} % — attestation non émise
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
              {graduatesMembers.length === 0 && (
                <li className="px-4 py-8 text-sm text-slate-500 text-center">
                  Aucun utilisateur dans cette structure
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl text-center"
          >
            <div className="sticky top-0 z-10 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 relative">
              <h2 id="admin-modal-title" className="text-sm font-semibold">
                {modalMode === "create" ? "Ajouter une structure" : "Modifier la structure"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Fermer"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">Structure</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputClass}
                    placeholder="Atelier Lumière"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">Mail RH</span>
                  <input
                    required
                    type="email"
                    value={form.rhEmail}
                    onChange={(e) => setForm((f) => ({ ...f, rhEmail: e.target.value }))}
                    className={inputClass}
                    placeholder="rh@entreprise.fr"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">Plan</span>
                  <select
                    value={form.plan}
                    onChange={(e) => {
                      const plan = e.target.value as PlanId;
                      setForm((f) => ({
                        ...f,
                        plan,
                        seats: PLAN_SEATS[plan],
                      }));
                    }}
                    className={inputClass}
                  >
                    <option value="starter">Micro — 390 € / an</option>
                    <option value="pro">TPE — 790 € / an</option>
                    <option value="pme">PME — 1 290 € / an</option>
                    <option value="enterprise">ETI — Sur devis</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">Accès max</span>
                  <input
                    type="number"
                    min={1}
                    max={form.plan === "enterprise" ? undefined : PLAN_SEATS[form.plan]}
                    value={form.seats}
                    onChange={(e) => {
                      const raw = Number(e.target.value) || 1;
                      const seats =
                        form.plan === "enterprise"
                          ? Math.max(1, raw)
                          : Math.min(PLAN_SEATS[form.plan], Math.max(1, raw));
                      setForm((f) => ({ ...f, seats }));
                    }}
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <CenteredDateField
                  label="Création"
                  required
                  value={form.createdAt}
                  onChange={(createdAt) =>
                    setForm((f) => ({
                      ...f,
                      createdAt,
                      nextInvoiceAt: billingDateFromCreation(createdAt),
                    }))
                  }
                />
                <CenteredDateField
                  label="Facturation"
                  required
                  value={form.nextInvoiceAt}
                  onChange={(nextInvoiceAt) =>
                    setForm((f) => ({ ...f, nextInvoiceAt }))
                  }
                />
                <label className="col-span-2 block space-y-1 sm:col-span-1">
                  <span className="text-xs font-medium text-slate-500">Téléphone</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={inputClass}
                    placeholder="06 12 34 56 78"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">Contact RH</span>
                  <input
                    value={form.rhName}
                    onChange={(e) => setForm((f) => ({ ...f, rhName: e.target.value }))}
                    className={inputClass}
                    placeholder="Prénom Nom"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">Mail facturation</span>
                  <input
                    type="email"
                    value={form.billingEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, billingEmail: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="finance@entreprise.fr"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">SIRET</span>
                  <input
                    value={form.siret}
                    onChange={(e) => setForm((f) => ({ ...f, siret: e.target.value }))}
                    className={`${inputClass} font-mono`}
                    placeholder="000 000 000 00000"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">Adresse</span>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className={inputClass}
                    placeholder="Adresse de facturation"
                  />
                </label>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "…" : modalMode === "create" ? "Créer" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
