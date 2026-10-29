import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "DPA — LockinIA",
  description:
    "Accord de sous-traitance (article 28 du RGPD) : rôles, traitements, isolation et sous-traitants LockinIA.",
};

export default function DpaPage() {
  return (
    <LegalShell title="Accord de sous-traitance (DPA)">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Objet</h2>
        <p>
          Le présent accord encadre le traitement de données personnelles confié par
          l&apos;entreprise cliente («&nbsp;responsable de traitement&nbsp;») à FITOPS AI
          («&nbsp;sous-traitant&nbsp;»), éditeur de LockinIA, au titre de l&apos;article 28 du
          RGPD. Il complète les{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/cgv">
            CGV
          </a>
          , les{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/cgu">
            CGU
          </a>{" "}
          et la{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/confidentialite">
            politique de confidentialité
          </a>
          .
        </p>
        <p>
          En souscrivant un abonnement LockinIA, en utilisant la plateforme pour former ses
          collaborateurs, ou en déployant LockinIA via un partenaire (organisme de formation /
          revendeur), l&apos;entreprise accepte le présent accord.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Parties</h2>
        <p>
          <strong>Responsable de traitement</strong> : l&apos;entreprise cliente qui décide des
          finalités (formation de ses salariés, suivi RH, registre des usages), qu&apos;elle
          souscrive directement ou via un partenaire.
        </p>
        <p>
          <strong>Sous-traitant</strong> : FITOPS AI, micro-entreprise, 119 rue Jules Parent,
          Rueil-Malmaison (92500), SIRET 853 780 906 00063. Contact :{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@lockin-web.online">
            contact@lockin-web.online
          </a>
          {" · "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="tel:+33662288656">
            06.62.28.86.56
          </a>
          .
        </p>
        <p>
          Lorsqu&apos;un <strong>partenaire</strong> (organisme de formation ou revendeur) déploie
          LockinIA pour le compte d&apos;entreprises clientes, ce partenaire peut agir comme
          responsable de traitement ou co-responsable selon sa relation contractuelle avec
          l&apos;entreprise finale. FITOPS AI demeure sous-traitant technique pour
          l&apos;hébergement et la mise à disposition de la plateforme.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Traitement confié</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Objet</strong> : hébergement mutualisé et mise à disposition de la plateforme
            LockinIA (comptes, formation, attestations, synthèse Article&nbsp;4, module
            entreprise / registre des usages, espaces RH et partenaire, invitations et quotas).
          </li>
          <li>
            <strong>Durée</strong> : pendant le contrat d&apos;abonnement (ou de partenariat),
            puis conservation des preuves de formation pendant l&apos;année civile de réalisation
            de l&apos;action et les trois années civiles suivantes (sauf obligation légale plus
            longue pour les factures).
          </li>
          <li>
            <strong>Nature</strong> : collecte, enregistrement, conservation, consultation,
            extraction (exports), suppression.
          </li>
          <li>
            <strong>Finalité</strong> : exécution du service LockinIA pour le compte du client ;
            FITOPS AI ne réutilise pas ces données pour un autre client ni pour du marketing.
          </li>
          <li>
            <strong>Personnes concernées</strong> : collaborateurs, administrateurs RH,
            contacts partenaires, et le cas échéant administrateurs LockinIA pour le support.
          </li>
          <li>
            <strong>Données</strong> : identité, e-mail, rôle, structure / partenaire,
            progression de formation, scores, attestations, métadonnées de synthèse
            Article&nbsp;4 (dates, version, empreinte, compteurs), indicateurs de suivi, quotas /
            sièges, invitations, contenu du module entreprise / registre des usages renseigné
            par le client, preuves archivées pendant la rétention due.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Hébergement, isolation et accès FITOPS AI
        </h2>
        <p>
          Les données sont hébergées sur l&apos;infrastructure de FITOPS AI (Firebase / Google
          Cloud, région eur3 — Union européenne — pour les données de compte et de formation).
          L&apos;isolation est logique (contrôles d&apos;accès par structure et par partenaire) :
          un client ne peut pas accéder aux données d&apos;un autre client.
        </p>
        <p>
          FITOPS AI peut consulter des <strong>indicateurs agrégés</strong> (nombre
          d&apos;entreprises, d&apos;inscrits, de parcours en cours ou terminés, consommation de
          sièges) pour le pilotage du service, la facturation et la capacité.
        </p>
        <p>
          L&apos;accès <strong>nominatif</strong> par FITOPS AI (identité d&apos;un apprenant,
          détail d&apos;un parcours) est limité aux cas suivants : support demandé par le client
          ou le partenaire, sécurité / incidents, facturation et contentieux, obligations légales
          ou demandes d&apos;autorité compétente, maintenance technique nécessaire. FITOPS AI ne
          consulte pas ces données à des fins commerciales propres.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Obligations de FITOPS AI
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Ne traiter les données que sur instruction documentée du client (abonnement,
            partenariat, usage de la plateforme, demandes écrites).
          </li>
          <li>Garantir la confidentialité des personnes autorisées à accéder aux données.</li>
          <li>
            Mettre en œuvre des mesures de sécurité raisonnables (authentification, contrôle
            d&apos;accès par structure / partenaire, hébergement Firestore en UE).
          </li>
          <li>
            Aider le client, dans la mesure du possible, à répondre aux demandes des personnes
            concernées.
          </li>
          <li>
            Informer le client sans délai injustifié en cas de violation de données personnelles
            affectant ses données.
          </li>
          <li>
            À la fin du contrat : supprimer les données du client dans les délais prévus, sauf
            conservation légale (factures) ou preuves encore dues au client (année de formation +
            3 années civiles).
          </li>
          <li>
            Mettre à disposition les informations nécessaires pour démontrer le respect du
            présent accord, sur demande écrite raisonnable.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Obligations du client
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Déterminer les finalités et la base légale du traitement (notamment formation au
            titre de l&apos;article 4 de l&apos;AI Act).
          </li>
          <li>Informer ses collaborateurs de l&apos;usage de LockinIA et de leurs droits.</li>
          <li>
            Ne fournir que les données nécessaires (nom, e-mail, rôle) et s&apos;assurer qu&apos;il
            est en droit de les transmettre.
          </li>
          <li>Gérer les accès RH et les invitations de manière sécurisée.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Partenaires (organismes de formation / revendeurs)
        </h2>
        <p>
          Le partenaire peut créer des entreprises clientes, suivre les quotas et consulter des
          statistiques agrégées ainsi que les contacts RH nécessaires au déploiement. Sauf
          besoin de support ou stipulation contraire au contrat de partenariat, le partenaire
          n&apos;exploite pas le détail nominatif de l&apos;ensemble des apprenants à des fins
          autres que l&apos;exécution du service. Le partenaire informe ses propres clients
          finaux de l&apos;hébergement chez FITOPS AI et des rôles respectifs.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Sous-traitants ultérieurs
        </h2>
        <p>
          Le client autorise FITOPS AI à recourir aux sous-traitants suivants, nécessaires au
          service :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Google Firebase / Google Cloud — authentification et base Firestore (région eur3,
            Union européenne).
          </li>
          <li>
            Vercel Inc. — hébergement et affichage du site (États-Unis), encadré par son accord
            de traitement et les clauses contractuelles types (voir{" "}
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href="https://vercel.com/legal/dpa"
              target="_blank"
              rel="noreferrer"
            >
              vercel.com/legal/dpa
            </a>
            ).
          </li>
        </ul>
        <p>
          Tout nouveau sous-traitant ultérieur est signalé au client (mise à jour de la politique
          de confidentialité ou e-mail). Le client peut s&apos;y opposer pour motif légitime ; à
          défaut d&apos;accord, il peut résilier selon les CGV.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Transferts</h2>
        <p>
          Les données de compte, de formation et de registre sont stockées dans l&apos;Union
          européenne. L&apos;affichage du site peut impliquer un transfert vers Vercel aux
          États-Unis, encadré comme indiqué ci-dessus.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Durée et fin</h2>
        <p>
          Le présent accord s&apos;applique pendant toute la durée du contrat LockinIA (abonnement
          ou partenariat). Il prend fin avec la suppression des données du client, sous réserve
          des conservations légales et des preuves encore dues.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Droit applicable</h2>
        <p>Droit français. Litiges : tribunaux compétents selon les règles en vigueur.</p>
      </section>
    </LegalShell>
  );
}
