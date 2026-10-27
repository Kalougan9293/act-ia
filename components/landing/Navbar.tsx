"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  const links = [
    { label: "Accompagnement", href: "/interventions" },
    { label: "Tarifs", href: onHome ? "#pricing" : "/#pricing" },
    {
      label: "Contact",
      href: "mailto:contact@lockin-web.online?subject=LockinIA%20-%20contact",
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
          : "bg-white/80 backdrop-blur-sm dark:bg-slate-900/80"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between pl-4 pr-6 sm:pl-6 sm:pr-8 lg:pl-8 lg:pr-12">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
        >
          <BrandMark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Lockin<span className="text-blue-600 dark:text-blue-400">IA</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const className = cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === link.href
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            );
            if (link.href.startsWith("mailto:")) {
              return (
                <a key={link.label} href={link.href} className={className}>
                  {link.label}
                </a>
              );
            }
            return (
              <Link key={link.label} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href="/rh"
            className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:inline-flex"
          >
            Espace RH
          </a>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const className = cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                pathname === link.href
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "text-slate-800 dark:text-slate-200"
              );
              if (link.href.startsWith("mailto:")) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={className}
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={className}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href="/rh"
              className="mt-1 rounded-xl bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Espace RH
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
