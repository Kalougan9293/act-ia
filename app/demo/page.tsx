import type { Metadata } from "next";
import DemoApp from "@/components/demo/DemoApp";

export const metadata: Metadata = {
  title: "Démo — ConformAI",
  description: "Testez ConformAI sans connexion : vue RH et vue collaborateurs.",
};

export default function DemoPage() {
  return <DemoApp />;
}
