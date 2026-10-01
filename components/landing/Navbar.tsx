"use client";

import { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
      )}
    >
      <nav className="max-w-7xl mx-auto pl-4 pr-6 sm:pl-6 sm:pr-8 lg:pl-8 lg:pr-12 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-lg tracking-tight">
          Conform<span className="text-blue-600 dark:text-blue-400">AI</span>
          <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} aria-hidden="true" />
        </a>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="#"
            className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Espace RH
          </a>
        </div>
      </nav>
    </header>
  );
}
