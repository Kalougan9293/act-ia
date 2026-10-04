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
          Les données sont traitées par ConformAI pour fournir la plateforme. Contact :{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@conformai.fr">
            contact@conformai.fr
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Données traitées</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Compte : nom, e-mail, mot de passe (hashé), rôle, structure.</li>
          <li>Formation : progression, scores, attestation de suivi.</li>
          <li>Espace RH / admin : liste des collaborateurs et indicateurs de suivi.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Finalités & bases</h2>
        <p>
          Exécution du contrat / intérêt légitime : créer le compte, délivrer la formation,
          produire les attestations et le registre de suivi pour l&apos;employeur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Conservation</h2>
        <p>
          Pendant le contrat : compte, progression et attestations restent disponibles pour
          l&apos;employeur. Après la fin du contrat : les preuves de formation (attestations,
          registre de suivi) sont conservées jusqu&apos;à 12 mois, sauf demande de suppression
          légitime ou obligation légale plus longue. Même règle pour tous les plans.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Vos droits</h2>
        <p>
          Accès, rectification, effacement, opposition, limitation, portabilité : contactez{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@conformai.fr">
            contact@conformai.fr
          </a>
          . Vous pouvez aussi saisir la CNIL.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Sous-traitants</h2>
        <p>
          Application web : Vercel. Données et authentification : Google Firebase / Google Cloud,
          base Firestore en Union européenne (région eur3).
        </p>
      </section>
    </LegalShell>
  );
}
