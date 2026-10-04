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
          Le site ConformAI, plateforme de formation et de traçabilité relative à la maîtrise de
          l&apos;IA (article 4 du règlement européen sur l&apos;IA), est édité par :
        </p>
        <p>
          FITOPS AI
          <br />
          119 rue Jules Parent
          <br />
          Rueil-Malmaison (92500)
          <br />
          SIRET 853 780 906 00063
        </p>
        <p>Micro-entreprise, sans capital social. Non immatriculée au RCS.</p>
        <p>TVA non applicable, article 293 B du CGI.</p>
        <p>Directeur de la publication : Jonathan Seroussi.</p>
        <p>
          Contact :{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@lockin-web.online">
            contact@lockin-web.online
          </a>
          {" · "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="tel:+33662288656">
            06.62.28.86.56
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis.
        </p>
        <p>
          Les données de la plateforme (comptes, formation, registre) sont hébergées par Google
          Firebase / Google Cloud. La base Firestore est située dans l&apos;Union européenne
          (région eur3).
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
