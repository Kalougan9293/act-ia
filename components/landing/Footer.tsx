import { GraduationCap } from "lucide-react";

const legal = [
  { label: "Mentions légales", href: "#" },
  { label: "Confidentialité", href: "#" },
  { label: "CGU", href: "#" },
  { label: "Cookies", href: "#" },
];

const conformity = [
  { label: "AI Act", href: "#" },
  { label: "RGPD", href: "#" },
  { label: "RS6776 & RS6601", href: "#" },
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
          <a href={item.href} className="hover:text-white transition-colors">
            {item.label}
          </a>
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
          <a href="#" className="flex items-center gap-1.5 justify-self-start shrink-0 font-bold text-white text-lg tracking-tight">
            Conform<span className="text-blue-400">AI</span>
            <GraduationCap className="w-5 h-5 text-blue-400" strokeWidth={2} aria-hidden="true" />
          </a>
          <LinkLine items={legal} />
          <div className="lg:justify-self-end">
            <LinkLine items={conformity} align="right" />
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ConformAI — Hébergé en France
        </div>
      </div>
    </footer>
  );
}
