"use client";

import { useMemo } from "react";
import FormationExperience from "@/components/user/FormationExperience";
import { BLOCKS } from "@/lib/formation/curriculum";
import { emptyProgress, type FormationProgress } from "@/lib/formation/proof";
import { emptyCompanyModule } from "@/lib/admin/types";

const DEMO_UID = "demo-camille-bernard";
const DEMO = {
  firstName: "Camille",
  fullName: "Camille Bernard",
  company: "Atelier Lumière",
  email: "camille.bernard@atelier-lumiere.fr",
};

/** Progression figée : intro + positionnement + bloc 1 terminés. */
function demoProgressAfterBlock1(): FormationProgress {
  const block1 = BLOCKS[0]!;
  const completedChapters = block1.chapters.map((c) => c.id);
  return {
    ...emptyProgress(),
    introDone: true,
    positioningDone: true,
    positioningScore: 75,
    completedChapters,
  };
}

export default function UserView() {
  const seed = useMemo(() => demoProgressAfterBlock1(), []);
  const companyModule = useMemo(() => emptyCompanyModule(), []);

  return (
    <div className="relative">
      <p className="mb-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
        Aperçu démonstration
      </p>

      {/* Même rendu que /utilisateur, figé (non cliquable) */}
      <div
        className="pointer-events-none mx-auto w-full max-w-6xl select-none scroll-pb-40 px-0 pb-16 pt-2 sm:pb-20 sm:pt-4"
        aria-hidden="true"
      >
        <FormationExperience
          key={DEMO_UID}
          uid={DEMO_UID}
          firstName={DEMO.firstName}
          fullName={DEMO.fullName}
          companyName={DEMO.company}
          companyModule={companyModule}
          demo
          demoSeed={seed}
        />
      </div>
    </div>
  );
}

export { DEMO as DEMO_USER };
