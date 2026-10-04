import Link from "next/link";
import { GraduationCap } from "lucide-react";

const legal = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGU", href: "/cgu" },
  { label: "Cookies", href: "/cookies" },
];

const conformity = [
  { label: "AI Act", href: "/ai-act" },
  { label: "RGPD", href: "/rgpd" },
];

function LinkLine({
  items,
  align = "center",
}: {
  items: { label: string; href: string }[];
  align?: "center" | "right";
}) {
  return (
    <div
      className={`text-xs sm:text-sm text-slate-400 whitespace-nowrap ${
        align === "right" ? "text-center lg:text-right" : "text-center"
      }`}
    >
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && (
            <span aria-hidden="true" className="mx-1.5 text-slate-600">
              ·
            </span>
          )}
          <Link href={item.href} className="hover:text-white transition-colors">
            {item.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-3 lg:grid lg:grid-cols-3 lg:items-center">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 justify-self-start text-lg font-bold tracking-tight text-white"
          >
            Conform<span className="text-blue-400">AI</span>
            <GraduationCap className="h-5 w-5 text-blue-400" strokeWidth={2} aria-hidden="true" />
          </Link>
          <LinkLine items={legal} />
          <div className="lg:justify-self-end">
            <LinkLine items={conformity} align="right" />
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ConformAI — Hébergé en France
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">
          Prise en charge OPCO possible via un organisme de formation partenaire Qualiopi, selon éligibilité.
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] leading-relaxed text-slate-500">
          Outils d&apos;aide à la conformité, pas un conseil juridique. L&apos;attestation
          documente vos mesures au titre de l&apos;article 4. Elle ne certifie pas l&apos;entreprise.
        </p>
      </div>
    </footer>
  );
}
