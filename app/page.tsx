import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBanner from "@/components/landing/TrustBanner";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />
      <Hero />
      <TrustBanner />
      <ProblemSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
