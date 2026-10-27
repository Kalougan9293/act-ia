import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBanner from "@/components/landing/TrustBanner";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DeploySection from "@/components/landing/DeploySection";
import PricingSection from "@/components/landing/PricingSection";
import GoFurtherSection from "@/components/landing/GoFurtherSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import { faqJsonLd } from "@/lib/landing/faq";

export const metadata: Metadata = {
  description:
    "Formation à l'IA pour les entreprises, au titre de l'article 4 de l'AI Act. Attestations nominatives et suivi des parcours pour la direction et les RH. À partir de 390 € par an.",
};

export default function Home() {
  const jsonLd = JSON.stringify(faqJsonLd()).replace(/</g, "\\u003c");

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Navbar />
      <Hero />
      <TrustBanner />
      <ProblemSection />
      <FeaturesSection />
      <DeploySection />
      <PricingSection />
      <GoFurtherSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
