import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Mentions légales — ConformAI",
};

export default function MentionsLegalesPage() {
  return (
    <LegalShell title="Mentions légales">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Éditeur</h2>
        <p>
          ConformAI — plateforme de formation et de traçabilité relative à la maîtrise de l&apos;IA
          (article 4 du règlement européen sur l&apos;IA).
        </p>
        <p>
          Contact :{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@conformai.fr">
            contact@conformai.fr
          </a>
        </p>
        <p className="text-xs text-slate-400">
          Raison sociale, forme juridique, SIRET et adresse du siège : à compléter avant mise en
          production commerciale.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Hébergement</h2>
        <p>
          Application web : Vercel Inc. Données applicatives : Google Firebase / Google Cloud
          (Union européenne, selon configuration du projet).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Responsabilité</h2>
        <p>
          ConformAI fournit des outils d&apos;aide à la conformité et une formation. Le contenu ne
          constitue pas un conseil juridique. L&apos;attestation de suivi documente les mesures
          prises au titre de l&apos;article 4 ; elle ne certifie pas l&apos;entreprise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Propriété intellectuelle</h2>
        <p>
          Les contenus, marques et éléments de la plateforme sont protégés. Toute reproduction non
          autorisée est interdite.
        </p>
      </section>
    </LegalShell>
  );
}
