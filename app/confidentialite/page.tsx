import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Confidentialité — ConformAI",
};

export default function ConfidentialitePage() {
  return (
    <LegalShell title="Politique de confidentialité">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Responsable</h2>
        <p>
          Les données sont traitées par FITOPS AI, 119 rue Jules Parent, Rueil-Malmaison (92500),
          SIRET 853 780 906 00063, éditeur de la plateforme ConformAI.
        </p>
        <p>
          Contact : Jonathan Seroussi,{" "}
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
          Aucun délégué à la protection des données n&apos;est désigné pour le moment. Les demandes
          se font à ce contact.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Données traitées</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Compte : nom, e-mail, mot de passe (hashé), rôle, structure.</li>
          <li>Formation : progression, scores, attestation de suivi.</li>
          <li>Espace RH / admin : liste des collaborateurs et indicateurs de suivi.</li>
          <li>Registre des usages d&apos;IA renseigné par l&apos;employeur.</li>
        </ul>
        <p>
          Lorsqu&apos;un salarié est invité, son nom et son e-mail sont d&apos;abord fournis par
          son employeur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Finalités et bases</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Compte de l&apos;entreprise, accès, formation, attestations et registre : exécution du
            contrat d&apos;abonnement.
          </li>
          <li>
            Données des salariés : traitées pour le compte de l&apos;entreprise cliente. C&apos;est
            elle qui décide de la formation, au titre de ses propres obligations, notamment
            l&apos;article 4 de l&apos;AI Act.
          </li>
          <li>Factures et pièces comptables : obligation légale.</li>
          <li>
            Journaux techniques (connexions, erreurs, sécurité) : intérêt légitime, limité à la
            protection du service.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Conservation</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Pendant le contrat : compte, progression, registre et attestations restent disponibles.</li>
          <li>
            Après la fin du contrat : pour les offres PME et ETI, les preuves de formation sont
            conservées 12 mois, puis supprimées, sauf obligation légale plus longue. Cette
            conservation n&apos;est pas incluse dans les offres Micro et TPE.
          </li>
          <li>Factures : 10 ans, durée comptable.</li>
          <li>Journaux techniques : 12 mois, puis suppression.</li>
        </ul>
        <p>
          La suppression d&apos;un compte se demande par e-mail à{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@lockin-web.online">
            contact@lockin-web.online
          </a>
          . L&apos;entreprise demande la fermeture de sa structure. Un salarié demande la
          suppression de son accès. Les preuves encore dues à l&apos;employeur et les factures sont
          conservées dans les durées ci-dessus.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Vos droits</h2>
        <p>
          Accès, rectification, effacement, opposition, limitation, portabilité : contactez{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@lockin-web.online">
            contact@lockin-web.online
          </a>
          . Vous pouvez aussi saisir la CNIL.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Destinataires</h2>
        <p>
          L&apos;employeur (espace RH de la structure) accède aux données de formation et au
          registre. Sous-traitants : Vercel, pour l&apos;affichage du site, et Google Firebase /
          Google Cloud, pour l&apos;authentification et la base Firestore.
        </p>
        <p>
          Les données de compte, de formation et de registre sont stockées dans l&apos;Union
          européenne (Firestore, région eur3), dans le cadre du contrat de traitement de Google
          Cloud. L&apos;affichage du site passe par Vercel Inc., établi aux États-Unis. Ce transfert
          est encadré par son accord de traitement et les clauses contractuelles types de la
          Commission européenne (décision 2021/914), publiés sur{" "}
          <a
            className="text-blue-600 hover:underline dark:text-blue-400"
            href="https://vercel.com/legal/dpa"
            target="_blank"
            rel="noreferrer"
          >
            vercel.com/legal/dpa
          </a>
          .
        </p>
        <p>
          Le détail des cookies et du stockage local figure sur la page{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/cookies">
            Cookies
          </a>
          .
        </p>
      </section>
    </LegalShell>
  );
}
