import type { Metadata } from "next";
import DemoApp from "@/components/demo/DemoApp";

export const metadata: Metadata = {
  title: "Démo — LockinIA",
  description: "Testez LockinIA sans connexion : vue RH et vue collaborateurs.",
};

export default function DemoPage() {
  return <DemoApp />;
}
