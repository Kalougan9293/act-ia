import { Suspense } from "react";
import ConnexionClient from "./ConnexionClient";

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
          Chargement…
        </div>
      }
    >
      <ConnexionClient />
    </Suspense>
  );
}
