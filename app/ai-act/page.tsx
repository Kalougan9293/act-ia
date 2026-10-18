import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "AI Act — StartIA",
  description:
    "Article 4 de l'AI Act : ce que demande la maîtrise de l'IA, et comment StartIA aide à documenter le suivi de formation.",
};

export default function AiActPage() {
  return (
    <LegalShell title="AI Act">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          De quoi parle-t-on ?
        </h2>
        <p>
          Le règlement européen sur l&apos;intelligence artificielle (AI Act) encadre les systèmes
          d&apos;IA selon leur niveau de risque. L&apos;article 4, applicable depuis le{" "}
          <strong>2 février 2025</strong>, demande aux organisations de prendre des mesures pour
          développer une maîtrise suffisante de l&apos;IA chez les personnes qui l&apos;utilisent
          pour le travail — y compris avec des outils grand public comme ChatGPT ou Copilot.
        </p>
        <p>
          Il n&apos;y a pas de seuil de taille d&apos;entreprise, ni de durée minimale imposée, ni
          d&apos;organisme obligatoire. L&apos;effort doit être proportionné aux usages. En cas de
          contrôle, d&apos;incident ou d&apos;audit client, pouvoir montrer que des mesures ont été
          prises et suivies devient décisif.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Ce que StartIA fournit
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Un parcours de sensibilisation (~1 h) adapté aux usages au travail</li>
          <li>Des attestations nominatives de suivi (qui, quand, résultat)</li>
          <li>Un tableau de bord RH et un export de preuves (ZIP / JSON)</li>
          <li>Des fiches métiers et un module entreprise (charte, outils, registre)</li>
        </ul>
        <p>
          StartIA aide à <strong>documenter une démarche</strong> au titre de l&apos;article 4. Ce
          n&apos;est ni un diplôme, ni une certification officielle, ni une attestation de conformité
          juridique de l&apos;entreprise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Ce que StartIA ne remplace pas
        </h2>
        <p>
          Un accompagnement juridique, un audit de conformité de vos systèmes d&apos;IA, ni la
          responsabilité de l&apos;employeur dans le choix des outils et des règles internes. Pour
          le détail du service :{" "}
          <Link href="/cgu" className="text-blue-600 hover:underline dark:text-blue-400">
            CGU
          </Link>
          .
        </p>
      </section>
    </LegalShell>
  );
}
