import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "RGPD — LockinIA",
  description:
    "RGPD et IA au travail : ce que traite LockinIA, et ce que le parcours enseigne aux équipes.",
};

export default function RgpdPage() {
  return (
    <LegalShell title="RGPD">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Deux sujets distincts
        </h2>
        <p>
          <strong>1. LockinIA en tant que prestataire</strong> — nous hébergeons de façon
          mutualisée des données de compte et de formation (identité, e-mail, progression,
          attestations) pour délivrer le service, avec isolation par entreprise / partenaire.
          FITOPS AI agit en sous-traitant : indicateurs agrégés pour le pilotage ; accès
          nominatif limité au support, à la sécurité, à la facturation et aux obligations
          légales. Les finalités, durées et droits figurent dans la{" "}
          <Link
            href="/confidentialite"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            politique de confidentialité
          </Link>
          . Le cadre de sous-traitance est décrit dans le{" "}
          <Link href="/dpa" className="text-blue-600 hover:underline dark:text-blue-400">
            DPA
          </Link>
          .
        </p>
        <p>
          <strong>2. Le parcours pédagogique</strong> — dès qu&apos;un salarié colle un nom, un
          e-mail, une voix ou un fichier client dans une IA, le RGPD s&apos;applique. La formation
          rappelle les réflexes concrets : quoi saisir ou ne pas saisir, données personnelles,
          secrets d&apos;entreprise, et quand alerter le référent ou le DPO.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Ce que le parcours couvre
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Données personnelles vs secrets d&apos;entreprise</li>
          <li>Minimisation et outils autorisés</li>
          <li>Décision humaine et publication de contenus générés</li>
          <li>Que faire en cas d&apos;erreur (alerte rapide)</li>
        </ul>
        <p>
          Ce n&apos;est <strong>pas</strong> un audit RGPD de votre organisation, ni un substitut à
          un DPO ou à un conseil juridique.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Hébergement</h2>
        <p>
          Les comptes, la formation et le suivi sont stockés dans l&apos;Union européenne
          (Firebase / Firestore, région eur3). L&apos;affichage du site passe par Vercel. Le détail
          des sous-traitants, des rôles (RH, partenaire, FITOPS AI) et des accès figure dans la
          politique de confidentialité et le DPA.
        </p>
      </section>
    </LegalShell>
  );
}
