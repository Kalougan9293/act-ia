import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "RGPD — ConformAI",
};

export default function RgpdPage() {
  return (
    <LegalShell title="RGPD">
      <p>
        ConformAI traite des données de compte et de formation pour délivrer le service. Les
        détails figurent dans la{" "}
        <Link href="/confidentialite" className="text-blue-600 hover:underline dark:text-blue-400">
          politique de confidentialité
        </Link>
        .
      </p>
      <p>
        Le parcours pédagogique rappelle aussi les réflexes RGPD utiles au quotidien lors de
        l&apos;usage de l&apos;IA (données personnelles, minimisation, outils autorisés).
      </p>
    </LegalShell>
  );
}
