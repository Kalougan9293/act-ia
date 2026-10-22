import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import InterventionsContent from "@/components/landing/InterventionsContent";

export const metadata: Metadata = {
  title: "Accompagnement IA — StartIA",
  description:
    "Faites de l'IA un outil de travail : former vos équipes, automatiser les tâches répétitives et intégrer l'IA dans vos processus.",
};

export default function InterventionsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100">
      <Navbar />
      <InterventionsContent />
      <Footer />
    </main>
  );
}
