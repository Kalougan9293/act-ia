"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileText, Pencil, Search, Trash2, X } from "lucide-react";
import { formatDate } from "@/lib/admin/format";
import { openPartnerInvoice } from "@/lib/admin/invoice";
import type { Partner } from "@/lib/admin/types";
import {
  listPartners,
  listStructuresByPartner,
  partnerSeatsAllocated,
  provisionPartnerUser,
  revokePartner,
  savePartner,
  updatePartnerProfile,
} from "@/lib/firebase/partners";

const inputClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-sm text-center";

type PartnerCompany = { id: string; name: string };
type PartnerRow = Partner & {
  seatsAllocated: number;
  companies: number;
  companyList: PartnerCompany[];
};
type ModalMode = "create" | "edit";

const emptyForm = () => ({
  name: "",
  email: "",
  contactName: "",
  siret: "",
  seatsMax: 50,
  licenseExpiresAt: "",
  notes: "",
});

export default function PartnersAdminPanel({
  createOpen = false,
  onCreateClose,
  onCountChange,
  onPartnersChange,
}: {
  /** Ouverture du formulaire depuis le bouton Ajouter global */
  createOpen?: boolean;
  onCreateClose?: () => void;
  onCountChange?: (count: number) => void;
  /** Liste complète (actifs + archivés) après chaque rechargement */
  onPartnersChange?: (partners: Partner[]) => void;
}) {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [companiesOf, setCompaniesOf] = useState<PartnerRow | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const all = await listPartners();
      onPartnersChange?.(all);
      const listed = all.filter((p) => p.status === "active" && !p.archivedAt);
      const rows: PartnerRow[] = await Promise.all(
        listed.map(async (partner) => {
          const structures = await listStructuresByPartner(partner.id);
          const active = structures
            .filter((s) => s.status === "active" && !s.archivedAt)
            .sort((a, b) => a.name.localeCompare(b.name, "fr"));
          return {
            ...partner,
            seatsAllocated: partnerSeatsAllocated(structures),
            companies: active.length,
            companyList: active.map((s) => ({ id: s.id, name: s.name })),
          };
        }),
      );
      const sorted = rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setPartners(sorted);
      onCountChange?.(sorted.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(partner: PartnerRow) {
    const ok = window.confirm(
      `Révoquer « ${partner.name} » ?\n\nL’accès OF sera coupé et le partenaire passera dans Archivés. Les entreprises clientes restent actives (à archiver séparément si besoin).`,
    );
    if (!ok) return;
    setError(null);
    try {
      await revokePartner(partner.id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Révocation impossible");
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- charge initiale
  }, []);

  useEffect(() => {
    if (createOpen) {
      setModalMode("create");
      setEditingId(null);
      setOriginalEmail("");
      setForm(emptyForm());
      setModalOpen(true);
    }
  }, [createOpen]);

  function openEdit(partner: PartnerRow) {
    setModalMode("edit");
    setEditingId(partner.id);
    setOriginalEmail(partner.email);
    setForm({
      name: partner.name,
      email: partner.email,
      contactName: "",
      siret: partner.siret,
      seatsMax: partner.seatsMax,
      licenseExpiresAt: partner.licenseExpiresAt ?? "",
      notes: partner.notes ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalMode("create");
    setEditingId(null);
    setOriginalEmail("");
    onCreateClose?.();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const email = form.email.trim().toLowerCase();
      const name = form.name.trim();
      const contactName = form.contactName.trim() || name;

      if (modalMode === "create") {
        const id = `prt_${crypto.randomUUID().slice(0, 8)}`;
        const today = new Date().toISOString().slice(0, 10);
        const partner: Partner = {
          id,
          name,
          email,
          siret: form.siret.trim(),
          status: "active",
          createdAt: today,
          archivedAt: null,
          seatsMax: Math.max(1, Number(form.seatsMax) || 1),
          licenseExpiresAt: form.licenseExpiresAt.trim() || null,
          notes: form.notes.trim() || null,
        };
        await savePartner(partner);
        await provisionPartnerUser({
          email,
          name: contactName,
          partnerId: id,
        });
      } else if (editingId) {
        const current = partners.find((p) => p.id === editingId);
        if (!current) throw new Error("Partenaire introuvable");
        const partner: Partner = {
          ...current,
          name,
          email,
          siret: form.siret.trim(),
          seatsMax: Math.max(1, Number(form.seatsMax) || 1),
          licenseExpiresAt: form.licenseExpiresAt.trim() || null,
          notes: form.notes.trim() || null,
        };
        await updatePartnerProfile(partner, {
          contactName: form.contactName.trim() || undefined,
          previousEmail: originalEmail,
        });
      }

      closeModal();
      await reload();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : modalMode === "create"
            ? "Création impossible"
            : "Enregistrement impossible",
      );
    } finally {
      setSaving(false);
    }
  }

  const filtered = partners.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.siret.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2.5">
        <div className="relative mx-auto max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, e-mail ou SIRET"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-center placeholder:text-slate-400"
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          {filtered.length} partenaire{filtered.length !== 1 ? "s" : ""}
          {query.trim() ? " trouvé(s)" : ""}
        </p>
      </div>

      {error && (
        <p className="px-3 py-2 text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          Chargement des partenaires…
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm text-center">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-2 py-1.5 font-medium text-xs">Partenaire</th>
                <th className="px-2 py-1.5 font-medium text-xs">Contact</th>
                <th
                  className="px-2 py-1.5 font-medium text-xs"
                  title="Sièges alloués / quota partenaire"
                >
                  Sièges
                </th>
                <th className="px-2 py-1.5 font-medium text-xs">Entreprises</th>
                <th className="px-2 py-1.5 font-medium text-xs">Création</th>
                <th
                  className="px-2 py-1.5 font-medium text-xs"
                  title="Fin de licence / prochaine échéance"
                >
                  Facturation
                </th>
                <th className="px-2 py-1.5 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((partner) => (
                <tr
                  key={partner.id}
                  className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <td className="px-2 py-1.5 font-medium truncate" title={partner.name}>
                    {partner.name}
                  </td>
                  <td
                    className="px-2 py-1.5 truncate text-xs sm:text-sm"
                    title={partner.email}
                  >
                    {partner.email}
                  </td>
                  <td className="px-2 py-1.5 tabular-nums">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {partner.seatsAllocated}
                    </span>
                    <span className="text-slate-400">/{partner.seatsMax}</span>
                  </td>
                  <td className="px-2 py-1.5 tabular-nums">
                    {partner.companies > 0 ? (
                      <button
                        type="button"
                        onClick={() => setCompaniesOf(partner)}
                        title="Voir les entreprises"
                        className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
                      >
                        {partner.companies}
                      </button>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                    {formatDate(partner.createdAt)}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                    {partner.licenseExpiresAt
                      ? formatDate(partner.licenseExpiresAt)
                      : "—"}
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        type="button"
                        aria-label="Générer la facture"
                        title="Générer la facture"
                        onClick={() => {
                          const opened = openPartnerInvoice(partner);
                          if (!opened) {
                            setError(
                              "Le navigateur a bloqué la facture. Autorisez les fenêtres.",
                            );
                          }
                        }}
                        className="rounded-md p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Modifier"
                        title="Modifier"
                        onClick={() => openEdit(partner)}
                        className="rounded-md p-1 text-slate-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Révoquer"
                        title="Révoquer l'accès OF"
                        onClick={() => void handleRevoke(partner)}
                        className="rounded-md p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-sm text-slate-500">
                    {query.trim()
                      ? "Aucun partenaire trouvé"
                      : "Aucun partenaire OF pour l'instant"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {companiesOf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-companies-title"
            className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl"
          >
            <div className="flex items-center justify-center border-b border-slate-100 dark:border-slate-800 px-4 py-3 relative">
              <h2
                id="partner-companies-title"
                className="text-sm font-semibold text-center px-8"
              >
                Entreprises — {companiesOf.name}
              </h2>
              <button
                type="button"
                onClick={() => setCompaniesOf(null)}
                aria-label="Fermer"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {companiesOf.companyList.map((c) => (
                <li
                  key={c.id}
                  className="px-4 py-2.5 text-sm text-center text-slate-800 dark:text-slate-200"
                >
                  {c.name}
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 text-center text-xs text-slate-500">
              {companiesOf.companies} entreprise
              {companiesOf.companies !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl text-center"
          >
            <div className="sticky top-0 z-10 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 relative">
              <h2 className="text-sm font-semibold">
                {modalMode === "create"
                  ? "Ajouter un organisme de formation"
                  : "Modifier le partenaire"}
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
                  <span className="text-xs font-medium text-slate-500">Organisme (OF)</span>
                  <input
                    required
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ex. Formation Horizon"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">
                    E-mail compte partenaire
                  </span>
                  <input
                    type="email"
                    required
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="contact@exemple-of.fr"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">Nom du contact</span>
                  <input
                    className={inputClass}
                    value={form.contactName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contactName: e.target.value }))
                    }
                    placeholder="Alex Martin"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">SIRET</span>
                  <input
                    className={inputClass}
                    value={form.siret}
                    onChange={(e) => setForm((f) => ({ ...f, siret: e.target.value }))}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">
                    Quota sièges global
                  </span>
                  <input
                    type="number"
                    min={1}
                    required
                    className={inputClass}
                    value={form.seatsMax}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, seatsMax: Number(e.target.value) || 1 }))
                    }
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">
                    Facturation / fin de licence
                  </span>
                  <input
                    className={inputClass}
                    placeholder="AAAA-MM-JJ (optionnel)"
                    value={form.licenseExpiresAt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, licenseExpiresAt: e.target.value }))
                    }
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-500">Notes</span>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </label>
              {modalMode === "create" ? (
                <p className="text-xs text-slate-500">
                  Un accès « Première connexion » sera préparé → espace /partenaire.
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Les modifications mettent à jour la fiche OF. Un changement d&apos;e-mail
                  synchronise le compte partenaire (et la 1ʳᵉ connexion si encore en
                  attente).
                </p>
              )}
              <div className="flex justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "…"
                    : modalMode === "create"
                      ? "Créer l'OF"
                      : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
