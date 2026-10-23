import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import { ASSISTANCE } from "@/lib/formation/assistance";
import { CONTENT_CHANGELOG } from "@/lib/formation/content-changelog";
import { PROGRAMME } from "@/lib/formation/programme";

export const metadata: Metadata = {
  title: "Fiche programme — StartIA",
  description:
    "Fiche programme de la formation StartIA : objectifs, public, prérequis, durée, méthodes, évaluation, accessibilité, tarif et déroulé.",
};

export default function ProgrammePage() {
  return (
    <LegalShell title="Fiche programme — formation StartIA">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Identification
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Intitulé</strong> : {PROGRAMME.intitule}
          </li>
          <li>
            <strong>Version</strong> : {PROGRAMME.version}
          </li>
          <li>
            <strong>Modalité</strong> : {PROGRAMME.modalite}
          </li>
          <li>
            <strong>Organisme / éditeur</strong> : {PROGRAMME.organisme}
          </li>
          <li>
            <strong>Contact</strong> :{" "}
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href={`mailto:${PROGRAMME.contact}`}
            >
              {PROGRAMME.contact}
            </a>
            {" · "}
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href={ASSISTANCE.phoneHref}
            >
              {PROGRAMME.phone}
            </a>
          </li>
        </ul>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {PROGRAMME.statutQualiopi}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Objectifs pédagogiques (évaluables)
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          {PROGRAMME.objectifs.map((obj) => (
            <li key={obj.label}>
              <strong>{obj.label}</strong>
              <br />
              <span className="text-slate-500 dark:text-slate-400">
                Critère d&apos;évaluation : {obj.evaluable}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Public</h2>
        <p>{PROGRAMME.public}</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Prérequis
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {PROGRAMME.prerequis.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Durée</h2>
        <p>
          <strong>{PROGRAMME.duree}</strong> — {PROGRAMME.dureeDetail}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Méthodes pédagogiques
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {PROGRAMME.methodes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          {ASSISTANCE.referentPedagogique.role} et {ASSISTANCE.referentTechnique.role} :{" "}
          {ASSISTANCE.referentPedagogique.name}. Réponse {ASSISTANCE.responseDelay}.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Modalités d&apos;évaluation
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {PROGRAMME.evaluation.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Déroulé réel du parcours
        </h2>
        <ol className="list-decimal space-y-2 pl-5">
          {PROGRAMME.deroule.map((step) => (
            <li key={step.etape}>
              <strong>{step.etape}</strong>
              {step.duree !== "—" ? ` (${step.duree})` : ""}
              <br />
              {step.detail}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Accessibilité — handicap
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {PROGRAMME.accessibilite.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Tarif</h2>
        <ul className="list-disc space-y-1 pl-5">
          {PROGRAMME.tarifs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Détail des offres :{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/#pricing">
            page Tarifs
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Financements possibles
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {PROGRAMME.financements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Veille — historique des mises à jour du contenu
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          {CONTENT_CHANGELOG.map((row) => (
            <li key={`${row.at}-${row.version}`}>
              <strong>{row.at}</strong> · {row.version} — {row.summary}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Documents associés
        </h2>
        <p>
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/cgv">
            CGV
          </a>
          {" · "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/cgu">
            CGU
          </a>
          {" · "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/ai-act">
            AI Act
          </a>
        </p>
      </section>
    </LegalShell>
  );
}
