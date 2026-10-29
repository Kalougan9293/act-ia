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
  Eye,
  FileText,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import AdminCertificatePreview from "@/components/admin/AdminCertificatePreview";
import PartnersAdminPanel from "@/components/admin/PartnersAdminPanel";
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
import { downloadLearnerAttestation } from "@/lib/export/attestations";
import { formatProofDate } from "@/lib/formation/proof";
import {
  PLAN_PRICES,
  PLAN_SEATS,
  emptyCompanyModule,
  type Partner,
  type PlanId,
  type PlatformUser,
  type Structure,
  type StructureFormValues,
} from "@/lib/admin/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  deletePartnerForever,
  listPartners,
  restorePartner,
} from "@/lib/firebase/partners";
import {
  deleteStructureAndUsers,
  deleteUser,
  ensureStructureRegistryId,
  purgeStructureForever,
  listStructures,
  listUsers,
  saveStructure,
  saveUser,
} from "@/lib/firebase/admin-data";
import { createRegistryId } from "@/lib/export/attestations";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  listSeatsUsedByStructure,
  syncStructureInviteSeats,
} from "@/lib/firebase/seats";
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
  const [view, setView] = useState<
    "active" | "archived" | "users" | "attestations" | "partners"
  >("active");
  const [graduatesStructureId, setGraduatesStructureId] = useState<string | null>(null);
  const [previewCertificateUser, setPreviewCertificateUser] =
    useState<PlatformUser | null>(null);
  const [structureQuery, setStructureQuery] = useState("");
  /** null = tous · direct = B2B · partner = via OF */
  const [structureOriginFilter, setStructureOriginFilter] = useState<
    null | "direct" | "partner"
  >(null);
  const [userQuery, setUserQuery] = useState("");
  /** null = tous · direct = B2B · partner = via OF */
  const [userOriginFilter, setUserOriginFilter] = useState<
    null | "direct" | "partner"
  >(null);
  const [attestationQuery, setAttestationQuery] = useState("");
  const [attestationPage, setAttestationPage] = useState(0);
  const [addChoiceOpen, setAddChoiceOpen] = useState(false);
  const [partnerCreateOpen, setPartnerCreateOpen] = useState(false);
  const [partnersCount, setPartnersCount] = useState(0);
  const [partners, setPartners] = useState<Partner[]>([]);
  /** Sièges consommés (inclut départs après démarrage ≥ 1 %) */
  const [seatsUsedByStructure, setSeatsUsedByStructure] = useState<
    Record<string, number>
  >({});
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
        const [listedStructures, nextUsers, pendingInvites, partners] =
          await Promise.all([
            listStructures(),
            listUsers(),
            listPendingInvites(),
            listPartners(),
          ]);
        const nextStructures = await Promise.all(
          listedStructures.map((structure) => ensureStructureRegistryId(structure)),
        );
        const seatsMap = await listSeatsUsedByStructure(nextStructures);
        if (!cancelled) {
          setPartners(partners);
          setPartnersCount(
            partners.filter((p) => p.status === "active" && !p.archivedAt).length,
          );
          setSeatsUsedByStructure(seatsMap);
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
  const archivedPartners = useMemo(
    () =>
      partners
        .filter((p) => !!p.archivedAt || p.status === "suspended")
        .sort((a, b) =>
          (b.archivedAt ?? b.createdAt).localeCompare(a.archivedAt ?? a.createdAt),
        ),
    [partners],
  );
  const archivedTotal = archivedStructures.length + archivedPartners.length;
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

  /** structureId → partnerId (null = B2B direct) */
  const structurePartnerIdById = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const s of structures) map.set(s.id, s.partnerId);
    return map;
  }, [structures]);

  const partnerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of partners) map.set(p.id, p.name);
    return map;
  }, [partners]);

  const filtered = useMemo(() => {
    const source = view === "archived" ? archivedStructures : activeStructures;
    const q = structureQuery.trim().toLowerCase();
    let list = source;
    if (view === "active" && structureOriginFilter === "direct") {
      list = list.filter((s) => !s.partnerId);
    } else if (view === "active" && structureOriginFilter === "partner") {
      list = list.filter((s) => Boolean(s.partnerId));
    }
    if (q) {
      list = list.filter((s) => {
        const email = structureEmail(s, users).toLowerCase();
        const partnerLabel = s.partnerId
          ? (partnerNameById.get(s.partnerId) ?? "").toLowerCase()
          : "";
        return (
          s.name.toLowerCase().includes(q) ||
          email.includes(q) ||
          s.billing.billingEmail.toLowerCase().includes(q) ||
          s.billing.siret.toLowerCase().includes(q) ||
          partnerLabel.includes(q)
        );
      });
    }
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
  }, [
    activeStructures,
    archivedStructures,
    users,
    sort,
    view,
    structureQuery,
    structureOriginFilter,
    partnerNameById,
  ]);

  const allPlatformUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    const list = users.filter((u) => {
      if (
        !(u.role === "employee" || (u.role === "rh" && u.formationEnrolled)) ||
        (u.structureId && !activeStructureIds.has(u.structureId))
      ) {
        return false;
      }
      const partnerId = u.structureId
        ? structurePartnerIdById.get(u.structureId) ?? null
        : null;
      const fromPartner = Boolean(partnerId);
      if (userOriginFilter === "direct" && fromPartner) return false;
      if (userOriginFilter === "partner" && !fromPartner) return false;
      if (!q) return true;
      const company = u.structureId
        ? structureNameById.get(u.structureId) ?? ""
        : "";
      const partnerLabel = partnerId
        ? (partnerNameById.get(partnerId) ?? "").toLowerCase()
        : "";
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        partnerLabel.includes(q) ||
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
  }, [
    users,
    activeStructureIds,
    structureNameById,
    structurePartnerIdById,
    partnerNameById,
    userSort,
    userQuery,
    userOriginFilter,
  ]);

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

  function openAddChoice() {
    setAddChoiceOpen(true);
  }

  function chooseAddEntreprise() {
    setAddChoiceOpen(false);
    setView("active");
    openCreate();
  }

  function chooseAddOf() {
    setAddChoiceOpen(false);
    setView("partners");
    setPartnerCreateOpen(true);
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
          registryId: createRegistryId(id),
          partnerId: null,
          article4Report: null,
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

  async function restoreArchivedPartner(partner: Partner) {
    const previous = partner;
    setPartners((current) =>
      current.map((p) =>
        p.id === partner.id ? { ...p, status: "active", archivedAt: null } : p,
      ),
    );
    setPartnersCount((n) => n + 1);
    try {
      await restorePartner(partner.id);
    } catch (e) {
      setPartners((current) =>
        current.map((p) => (p.id === partner.id ? previous : p)),
      );
      setPartnersCount((n) => Math.max(0, n - 1));
      setLoadError(e instanceof Error ? e.message : "Restauration impossible");
    }
  }

  async function deleteArchivedPartnerForever(partner: Partner) {
    const ok = window.confirm(
      `Supprimer définitivement « ${partner.name} » ?\n\nLes comptes OF seront effacés. Les entreprises clientes restent (détachées du partenaire).`,
    );
    if (!ok) return;
    const previous = partners;
    setPartners((current) => current.filter((p) => p.id !== partner.id));
    try {
      await deletePartnerForever(partner.id);
    } catch (e) {
      setPartners(previous);
      setLoadError(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  async function deleteStructureForever(structure: Structure) {
    const alreadyArchived = Boolean(structure.archivedAt);
    const ok = window.confirm(
      alreadyArchived
        ? `Supprimer définitivement « ${structure.name} » ?\n\nLa fiche disparaîtra des archivés. Les preuves de formation restent conservées (année + 3 ans).`
        : `Retirer les comptes de « ${structure.name} » ? Les preuves de formation restent archivées (année + 3 ans). La structure passe en archivée.`,
    );
    if (!ok) return;
    const linked = users.filter(
      (u) => u.structureId === structure.id && !u.id.startsWith("invite:"),
    );
    try {
      await deleteInvitesForStructure(structure.id);
      if (alreadyArchived) {
        await purgeStructureForever(
          structure.id,
          linked.map((u) => u.id),
        );
        setStructures((current) => current.filter((s) => s.id !== structure.id));
      } else {
        await deleteStructureAndUsers(
          structure.id,
          linked.map((u) => u.id),
        );
        const archivedAt = new Date().toISOString().slice(0, 10);
        setStructures((current) =>
          current.map((s) =>
            s.id === structure.id
              ? { ...s, status: "suspended", archivedAt }
              : s,
          ),
        );
      }
      setUsers((current) => current.filter((u) => u.structureId !== structure.id));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  async function deletePlatformUser(user: PlatformUser) {
    const ok = window.confirm(
      `Retirer « ${user.name} » (${user.email}) ? Les preuves de formation restent archivées pour la structure (année + 3 ans).`,
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
    if (view === "partners") return;
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
              <BrandMark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Lockin<span className="text-blue-600 dark:text-blue-400">IA</span>
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
            onClick={openAddChoice}
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

        <div className="mx-auto grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-3xl">
          <button
            type="button"
            onClick={() => {
              setView("active");
              setStructureQuery("");
              setStructureOriginFilter(null);
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
            onClick={() => setView("partners")}
            className={`rounded-lg border px-3 py-2.5 shadow-sm transition-colors ${
              view === "partners"
                ? "border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
              <Users className="h-3.5 w-3.5" />
              Partenaires
            </div>
            <div className="mt-0.5 text-2xl font-bold tabular-nums">{partnersCount}</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setView("users");
              setUserQuery("");
              setUserOriginFilter(null);
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
            <div className="mt-0.5 text-2xl font-bold tabular-nums">{archivedTotal}</div>
          </button>
        </div>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {view === "partners" ? (
            <PartnersAdminPanel
              createOpen={partnerCreateOpen}
              onCreateClose={() => setPartnerCreateOpen(false)}
              onCountChange={setPartnersCount}
              onPartnersChange={setPartners}
            />
          ) : view === "users" ? (
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
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setUserOriginFilter((f) => (f === "direct" ? null : "direct"))
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition-colors ${
                    userOriginFilter === "direct"
                      ? "border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-400 dark:bg-blue-500/30 dark:text-blue-100"
                      : "border-transparent text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-500/10"
                  }`}
                  title={
                    userOriginFilter === "direct"
                      ? "Réafficher tous les utilisateurs"
                      : "Filtrer : B2B direct uniquement"
                  }
                >
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                  B2B direct
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setUserOriginFilter((f) =>
                      f === "partner" ? null : "partner",
                    )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition-colors ${
                    userOriginFilter === "partner"
                      ? "border-violet-400 bg-violet-100 text-violet-800 dark:border-violet-400 dark:bg-violet-500/30 dark:text-violet-100"
                      : "border-transparent text-slate-600 hover:bg-violet-50 dark:text-slate-300 dark:hover:bg-violet-500/10"
                  }`}
                  title={
                    userOriginFilter === "partner"
                      ? "Réafficher tous les utilisateurs"
                      : "Filtrer : via partenaire uniquement"
                  }
                >
                  <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                  Via partenaire
                </button>
              </div>
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
                  const partnerId = user.structureId
                    ? structurePartnerIdById.get(user.structureId) ?? null
                    : null;
                  const fromPartner = Boolean(partnerId);
                  const partnerName = partnerId
                    ? partnerNameById.get(partnerId) ?? null
                    : null;
                  const companyLabel =
                    fromPartner && partnerName
                      ? `${company} (${partnerName})`
                      : company;
                  const before =
                    user.positioningScore != null ? `${user.positioningScore}` : "—";
                  const after = user.quizScore != null ? `${user.quizScore}` : "—";
                  const rowClass = fromPartner
                    ? "border-t border-violet-300 bg-violet-200 dark:border-violet-400/50 dark:bg-violet-500/40 hover:bg-violet-300 dark:hover:bg-violet-500/50"
                    : "border-t border-blue-300 bg-blue-200 dark:border-blue-400/50 dark:bg-blue-500/40 hover:bg-blue-300 dark:hover:bg-blue-500/50";
                  return (
                    <tr
                      key={user.id}
                      className={`${rowClass} transition-colors`}
                      title={
                        fromPartner
                          ? partnerName
                            ? `Via partenaire : ${partnerName}`
                            : "Via partenaire"
                          : "Entreprise B2B directe"
                      }
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
                      <td
                        className="px-2 py-1.5 truncate text-xs sm:text-sm"
                        title={companyLabel}
                      >
                        {company}
                        {fromPartner && partnerName ? (
                          <span className="font-normal text-violet-700 dark:text-violet-200">
                            {" "}
                            ({partnerName})
                          </span>
                        ) : null}
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
            {view === "archived" && (
              <div className="border-b border-violet-100 bg-violet-50/60 dark:border-violet-500/20 dark:bg-violet-500/10">
                <div className="px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    Partenaires archivés
                  </p>
                  <p className="mt-0.5 text-xs text-violet-500/80 dark:text-violet-400/70">
                    {archivedPartners.length} partenaire
                    {archivedPartners.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm text-center">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[28%]" />
                      <col className="w-[16%]" />
                      <col className="w-[16%]" />
                      <col className="w-[12%]" />
                    </colgroup>
                    <thead className="text-violet-600/80 dark:text-violet-300/80">
                      <tr>
                        <th className="px-2 py-1.5 font-medium text-xs">Partenaire</th>
                        <th className="px-2 py-1.5 font-medium text-xs">Contact</th>
                        <th className="px-2 py-1.5 font-medium text-xs">Création</th>
                        <th className="px-2 py-1.5 font-medium text-xs">Archivé le</th>
                        <th className="px-2 py-1.5 font-medium"> </th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedPartners.map((partner) => (
                        <tr
                          key={partner.id}
                          className="border-t border-violet-100/80 dark:border-violet-500/15 hover:bg-violet-100/50 dark:hover:bg-violet-500/15 transition-colors"
                        >
                          <td
                            className="px-2 py-1.5 font-medium truncate"
                            title={partner.name}
                          >
                            {partner.name}
                          </td>
                          <td
                            className="px-2 py-1.5 truncate text-xs sm:text-sm"
                            title={partner.email}
                          >
                            {partner.email}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                            {formatDate(partner.createdAt)}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                            {partner.archivedAt ? formatDate(partner.archivedAt) : "—"}
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center justify-center gap-0.5">
                              <button
                                type="button"
                                aria-label="Restaurer"
                                title="Restaurer le partenaire"
                                onClick={() => void restoreArchivedPartner(partner)}
                                className="rounded-md p-1 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Supprimer définitivement"
                                title="Supprimer définitivement"
                                onClick={() => void deleteArchivedPartnerForever(partner)}
                                className="rounded-md p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {archivedPartners.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-sm text-slate-500">
                            Aucun partenaire archivé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div
              className={
                view === "archived"
                  ? "border-b border-blue-100 bg-blue-50/60 px-3 py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10"
                  : "border-b border-slate-100 px-3 py-2.5 dark:border-slate-800"
              }
            >
              {view === "archived" ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Structures archivées
                  <span className="ml-2 font-normal normal-case tracking-normal text-blue-500/80 dark:text-blue-400/70">
                    {filtered.length}
                  </span>
                </p>
              ) : (
                <>
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
                  <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setStructureOriginFilter((f) =>
                          f === "direct" ? null : "direct",
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition-colors ${
                        structureOriginFilter === "direct"
                          ? "border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-400 dark:bg-blue-500/30 dark:text-blue-100"
                          : "border-transparent text-slate-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:bg-blue-500/10"
                      }`}
                      title={
                        structureOriginFilter === "direct"
                          ? "Réafficher toutes les structures"
                          : "Filtrer : B2B direct uniquement"
                      }
                    >
                      <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                      B2B direct
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStructureOriginFilter((f) =>
                          f === "partner" ? null : "partner",
                        )
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition-colors ${
                        structureOriginFilter === "partner"
                          ? "border-violet-400 bg-violet-100 text-violet-800 dark:border-violet-400 dark:bg-violet-500/30 dark:text-violet-100"
                          : "border-transparent text-slate-600 hover:bg-violet-50 dark:text-slate-300 dark:hover:bg-violet-500/10"
                      }`}
                      title={
                        structureOriginFilter === "partner"
                          ? "Réafficher toutes les structures"
                          : "Filtrer : via partenaire uniquement"
                      }
                    >
                      <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                      Via partenaire
                    </button>
                  </div>
                </>
              )}
            </div>
            <div
              className={`overflow-x-auto ${
                view === "archived"
                  ? "bg-blue-50/40 dark:bg-blue-500/[0.07]"
                  : ""
              }`}
            >
            <table className="w-full table-fixed text-sm text-center">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead
                className={
                  view === "archived"
                    ? "text-blue-600/80 dark:text-blue-300/80"
                    : "text-slate-500 dark:text-slate-400"
                }
              >
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
                  <th className="px-2 py-1.5 font-medium text-xs" title="Identifiant de suivi Article 4">
                    Suivi
                  </th>
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
                  const seatsUsed = Math.max(
                    grads.total,
                    seatsUsedByStructure[structure.id] ?? grads.total,
                  );
                  const seatsRetained = Math.max(0, seatsUsed - grads.total);
                  const fromPartner = Boolean(structure.partnerId);
                  const partnerName = structure.partnerId
                    ? partnerNameById.get(structure.partnerId) ?? null
                    : null;
                  const rowTint =
                    view === "archived"
                      ? "border-t border-blue-100/80 dark:border-blue-500/15 hover:bg-blue-100/50 dark:hover:bg-blue-500/15"
                      : fromPartner
                        ? "border-t border-violet-300 bg-violet-200 dark:border-violet-400/50 dark:bg-violet-500/40 hover:bg-violet-300 dark:hover:bg-violet-500/50"
                        : "border-t border-blue-300 bg-blue-200 dark:border-blue-400/50 dark:bg-blue-500/40 hover:bg-blue-300 dark:hover:bg-blue-500/50";
                  return (
                  <tr
                    key={structure.id}
                    className={`${rowTint} transition-colors`}
                    title={
                      fromPartner
                        ? partnerName
                          ? `Via partenaire : ${partnerName}`
                          : "Entreprise ajoutée par un partenaire"
                        : "Entreprise B2B directe"
                    }
                  >
                    <td
                      className="px-2 py-1.5 font-medium truncate"
                      title={
                        partnerName
                          ? `${structure.name} (${partnerName})`
                          : structure.name
                      }
                    >
                      {structure.name}
                      {partnerName ? (
                        <span className="font-normal text-violet-700 dark:text-violet-200">
                          {" "}
                          ({partnerName})
                        </span>
                      ) : null}
                    </td>
                    <td
                      className="px-2 py-1.5 truncate text-xs sm:text-sm"
                      title={structureEmail(structure, users)}
                    >
                      {structureEmail(structure, users)}
                    </td>
                    <td className="px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setGraduatesStructureId(structure.id)}
                        className="max-w-full truncate font-mono text-[11px] text-blue-600 hover:underline dark:text-blue-400"
                        title={`Suivi Article 4 — voir les attestations (${structure.registryId})`}
                      >
                        {structure.registryId}
                      </button>
                    </td>
                    <td className="px-2 py-1.5 tabular-nums">
                      <button
                        type="button"
                        onClick={() => setGraduatesStructureId(structure.id)}
                        className="rounded-md px-1.5 py-0.5 font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        title={
                          `Formés / comptes actifs / sièges consommés / capacité.\n` +
                          (seatsRetained > 0
                            ? `${seatsRetained} siège(s) non récupéré(s) : départ après démarrage (≥ 1 %).`
                            : `Aucun siège retenu hors comptes actifs.`)
                        }
                      >
                        {grads.graduated}
                        <span className="font-normal text-emerald-600 dark:text-emerald-400">
                          /{grads.total}
                        </span>
                        <span className="font-normal text-amber-600 dark:text-amber-400">
                          /{seatsUsed}
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

            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {graduatesMembers.map((user) => {
                const done = Boolean(user.certificateId);
                const stamp = user.certifiedAt
                  ? formatProofDate(user.certifiedAt)
                  : null;
                return (
                  <li
                    key={user.id}
                    className="px-4 py-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  >
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="truncate text-xs text-slate-500">{user.email}</div>
                    {done ? (
                      <>
                        <div className="mt-1 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                          {user.certificateId}
                          {user.quizScore != null ? ` · ${user.quizScore} %` : ""}
                          {user.certifiedAt
                            ? ` · ${formatDate(user.certifiedAt)}`
                            : ""}
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewCertificateUser(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Voir
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!user.certificateId || !graduatesStructure) return;
                              downloadLearnerAttestation({
                                fullName: user.name,
                                role: user.role === "rh" ? "RH" : "Collaborateur",
                                companyName:
                                  graduatesStructure.billing.companyName ||
                                  graduatesStructure.name,
                                certificateId: user.certificateId,
                                quizScore: user.quizScore ?? 0,
                                issuedAt: user.certifiedAt,
                                dateLabel: stamp?.date ?? formatDate(new Date().toISOString()),
                                timeLabel: stamp?.time ?? "10:00",
                                specimen: false,
                                timeSpentSec: user.attestationTimeSpentSec,
                                modulesCompleted: user.attestationModulesCompleted,
                              });
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-1 text-[11px] text-slate-400">
                        {user.progressPercent ?? 0} % — attestation non émise
                      </div>
                    )}
                  </li>
                );
              })}
              {graduatesMembers.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-slate-500">
                  Aucun utilisateur dans cette structure
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {addChoiceOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-4"
          onClick={() => setAddChoiceOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Ajouter"
            className="grid w-full max-w-lg grid-cols-2 gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={chooseAddEntreprise}
              className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-10 text-2xl font-bold tracking-tight text-blue-800 shadow-xl transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/20 sm:text-3xl"
            >
              Entreprise
            </button>
            <button
              type="button"
              onClick={chooseAddOf}
              className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-10 text-2xl font-bold tracking-tight text-violet-800 shadow-xl transition-colors hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/20 sm:text-3xl"
            >
              OF
            </button>
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
