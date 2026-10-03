"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Building2,
  FileText,
  GraduationCap,
  Mail,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AdminCertificatePreview from "@/components/admin/AdminCertificatePreview";
import { formatDate } from "@/lib/admin/format";
import { findStructureById, findUserById } from "@/lib/admin/mock-data";
import { ROLE_LABELS, STATUS_LABELS } from "@/lib/admin/types";

export default function CandidateProfile({ userId }: { userId: string }) {
  const user = findUserById(userId);
  const structure = user ? findStructureById(user.structureId) : null;
  const [showPdf, setShowPdf] = useState(false);

  if (!user || user.role === "super_admin") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
          <h1 className="text-xl font-bold">Candidat introuvable</h1>
          <Link href="/admin" className="text-sm font-semibold text-blue-600 hover:underline">
            Retour à l&apos;admin
          </Link>
        </div>
      </div>
    );
  }

  const graduated = user.progressPercent === 100 && !!user.certificateId;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 font-bold text-lg tracking-tight">
              Conform<span className="text-blue-600 dark:text-blue-400">AI</span>
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Fiche candidat
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {user.email}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-4 shadow-sm">
            <div className="text-xs text-slate-500">Rôle</div>
            <div className="mt-1 text-sm font-semibold">{ROLE_LABELS[user.role]}</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-4 shadow-sm">
            <div className="text-xs text-slate-500">Statut</div>
            <div className="mt-1 text-sm font-semibold">{STATUS_LABELS[user.status]}</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-4 shadow-sm">
            <div className="text-xs text-slate-500">Avancement</div>
            <div className="mt-1 text-sm font-semibold tabular-nums">
              {user.progressPercent == null ? "—" : `${user.progressPercent} %`}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-4 shadow-sm">
            <div className="text-xs text-slate-500">Score</div>
            <div className="mt-1 text-sm font-semibold tabular-nums">
              {user.quizScore == null ? "—" : `${user.quizScore} %`}
            </div>
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold flex items-center justify-center gap-2">
            <Award className="h-4 w-4 text-blue-600" />
            Attestation de suivi
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">N° attestation</dt>
              <dd className="mt-0.5 font-mono font-semibold">
                {user.certificateId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Date d&apos;obtention</dt>
              <dd className="mt-0.5 font-medium">{formatDate(user.certifiedAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Score quiz</dt>
              <dd className="mt-0.5 font-medium">
                {user.quizScore == null ? "—" : `${user.quizScore} / 100`}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Structure</dt>
              <dd className="mt-0.5 font-medium flex items-center justify-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {structure?.name ?? "—"}
              </dd>
            </div>
          </dl>

          {graduated ? (
            <button
              type="button"
              onClick={() => setShowPdf(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Voir le PDF
            </button>
          ) : (
            <p className="text-xs text-slate-500 text-center">
              Parcours non terminé — l&apos;attestation de suivi sera disponible à 100 %.
            </p>
          )}
        </section>
      </main>

      {showPdf && (
        <AdminCertificatePreview
          user={user}
          structure={structure}
          onClose={() => setShowPdf(false)}
        />
      )}
    </div>
  );
}
