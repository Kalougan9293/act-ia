"use client";

import { X } from "lucide-react";
import type { PlatformUser, Structure } from "@/lib/admin/types";
import { formatDate } from "@/lib/admin/format";

function FakeQr() {
  const cells = [
    "111011101",
    "100010001",
    "101110101",
    "101010101",
    "111011101",
    "000100010",
    "110101011",
    "101000101",
    "111011101",
  ];

  return (
    <div className="inline-grid grid-cols-9 gap-px bg-white p-1 border border-slate-300" aria-hidden="true">
      {cells.flatMap((row, y) =>
        row.split("").map((cell, x) => (
          <span
            key={`${y}-${x}`}
            className={`w-2 h-2 ${cell === "1" ? "bg-slate-900" : "bg-white"}`}
          />
        )),
      )}
    </div>
  );
}

export default function AdminCertificatePreview({
  user,
  structure,
  onClose,
}: {
  user: PlatformUser;
  structure: Structure | null;
  onClose: () => void;
}) {
  const certificateId = user.certificateId ?? "—";
  const score = user.quizScore ?? 0;
  const issuedAt = user.certifiedAt
    ? `${formatDate(user.certifiedAt)} à 10:00 (Europe/Paris)`
    : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white text-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-900"
          aria-label="Fermer l'attestation"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 sm:px-12 py-10 space-y-8">
          <header className="text-center space-y-2 border-b border-slate-200 pb-6">
            <div className="text-sm font-bold tracking-[0.25em] text-blue-600">CONFORMAI</div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Attestation de suivi de formation et de sensibilisation
            </h2>
            <p className="text-center text-sm text-slate-600">
              Intelligence artificielle — EU AI Act &amp; RGPD
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 pt-2 text-xs text-slate-500">
              <span>Attestation n° {certificateId}</span>
              <span>Version 1.0</span>
              <span className="text-amber-700 font-semibold">Spécimen de démonstration</span>
            </div>
          </header>

          <section className="space-y-3 text-center">
            <h3 className="text-xs font-bold tracking-widest text-blue-700">01 — Bénéficiaire</h3>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="text-sm text-slate-600">
              {structure?.billing.companyName ?? structure?.name ?? "—"}
            </p>
          </section>

          <section className="space-y-3 text-center">
            <h3 className="text-xs font-bold tracking-widest text-blue-700">02 — Résultat</h3>
            <p className="text-sm text-slate-700">
              Score obtenu : <span className="font-semibold">{score} %</span>
            </p>
            <p className="text-sm text-slate-700">Délivrée le {issuedAt}</p>
          </section>

          <footer className="flex flex-col items-center gap-3 border-t border-slate-200 pt-6">
            <FakeQr />
            <p className="text-center text-xs text-slate-500 max-w-md">
              Document horodaté à des fins de démonstration. La version production liera un hash
              d&apos;intégrité et un export PDF.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
