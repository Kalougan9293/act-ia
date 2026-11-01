import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "AI Act — LockinIA",
  description:
    "Article 4 de l'AI Act : ce que demande la maîtrise de l'IA, et comment LockinIA aide à documenter le suivi de formation.",
};

export default function AiActPage() {
  return (
    <LegalShell title="AI Act">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          De quoi parle-t-on ?
        </h2>
        <p>
          Le règlement européen sur l&apos;intelligence artificielle (AI Act,
          règlement&nbsp;(UE)&nbsp;2024/1689) encadre les systèmes d&apos;IA selon leur niveau
          de risque. L&apos;article&nbsp;4, applicable depuis le{" "}
          <strong>2 février 2025</strong>, impose aux fournisseurs et aux déployeurs de
          systèmes d&apos;IA de prendre des mesures pour{" "}
          <strong>favoriser le développement de la maîtrise de l&apos;IA</strong> de leur
          personnel et des personnes qui utilisent ou font fonctionner ces systèmes pour
          leur compte — y compris avec des outils grand public comme ChatGPT ou Copilot.
        </p>
        <p>
          Depuis le règlement (UE)&nbsp;2026/1744 (Digital Omnibus on AI, en vigueur), le
          texte précise que l&apos;obligation porte sur les{" "}
          <strong>mesures mises en œuvre</strong>, et non sur la garantie d&apos;un niveau
          individuel déterminé de compétence.
        </p>
        <p>
          L&apos;article&nbsp;4 ne prévoit pas de plafond d&apos;amende qui lui soit propre
          (pas de barème type «&nbsp;15&nbsp;M€ ou 3&nbsp;%&nbsp;» attaché à cette seule
          obligation). Toutefois, le non-respect peut donner lieu à des mesures
          d&apos;exécution ou à des sanctions selon le droit applicable : l&apos;absence de
          barème autonome ne signifie pas une absence de risque juridique.
        </p>
        <p>
          Il n&apos;y a pas de seuil de taille d&apos;entreprise, ni de durée minimale
          imposée, ni d&apos;organisme obligatoire. En cas de contrôle, d&apos;incident ou
          d&apos;audit client, pouvoir montrer que des mesures ont été prises et
          documentées devient décisif.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Calendrier (jalons utiles)
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>2 août 2025</strong> — obligations relatives aux modèles d&apos;IA à
            usage général (GPAI) et certaines dispositions de gouvernance
          </li>
          <li>
            <strong>2 août 2026</strong> — obligations de transparence de l&apos;article&nbsp;50
            (chatbots, certains contenus synthétiques)
          </li>
          <li>
            <strong>2 décembre 2026</strong> — certaines interdictions spécifiques sur des
            contenus illicites (ex. contenus intimes non consentis), distinctes des
            obligations générales de transparence
          </li>
          <li>
            <strong>2 décembre 2027</strong> — règles applicables aux systèmes d&apos;IA à
            haut risque concernés par l&apos;annexe&nbsp;III (dont emploi / recrutement),
            selon la finalité du système — tous les outils RH intégrant de l&apos;IA ne sont
            pas automatiquement à haut risque
          </li>
          <li>
            <strong>2 août 2028</strong> — certaines catégories liées à l&apos;article&nbsp;6,
            paragraphe&nbsp;1, et aux produits réglementés de l&apos;annexe&nbsp;I
          </li>
        </ul>
        <p>
          Indépendamment de ce calendrier, l&apos;article&nbsp;22 du RGPD encadre déjà les
          décisions individuelles fondées exclusivement sur un traitement automatisé
          lorsqu&apos;elles produisent des effets juridiques ou affectent significativement
          une personne de manière similaire — y compris certains usages RH.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Ce que LockinIA fournit
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Un parcours de sensibilisation (1 h 15) adapté aux usages au travail</li>
          <li>Des attestations nominatives de suivi (qui, quand, résultat)</li>
          <li>Un tableau de bord RH et un export de preuves (ZIP / JSON)</li>
          <li>Des fiches métiers et un module entreprise (charte, outils, registre)</li>
        </ul>
        <p>
          LockinIA aide à <strong>structurer et documenter une démarche</strong> au titre
          de l&apos;article&nbsp;4 (sensibilisation, formation, suivi). Ce n&apos;est ni un
          diplôme, ni une certification officielle, ni une attestation de conformité
          juridique de l&apos;entreprise : un parcours seul ne garantit pas la conformité.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Ce que LockinIA ne remplace pas
        </h2>
        <p>
          Un accompagnement juridique, un audit de conformité de vos systèmes d&apos;IA, ni
          la responsabilité de l&apos;employeur dans le choix des outils et des règles
          internes. Pour le détail du service :{" "}
          <Link href="/cgu" className="text-blue-600 hover:underline dark:text-blue-400">
            CGU
          </Link>
          .
        </p>
      </section>
    </LegalShell>
  );
}
