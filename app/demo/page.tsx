import type { Metadata } from "next";
import DemoApp from "@/components/demo/DemoApp";

export const metadata: Metadata = {
  title: "Démo — StartIA",
  description: "Testez StartIA sans connexion : vue RH et vue collaborateurs.",
};

export default function DemoPage() {
  return <DemoApp />;
}
