import React from "react";
import { Sparkles } from "lucide-react";
import { getParcoursSectionPlayData } from "@/lib/actions/parcoursActions";
import { ParcoursSectionPlayView } from "@/components/game/ParcoursSectionPlayView";
import { GameShell } from "@/components/game/GameShell";
import { GameBackLink } from "@/components/game/GameUI";

export const dynamic = "force-dynamic";

export default async function ParcoursSectionPlayPage({
  params,
}: {
  params: Promise<{ stageId: string; sectionId: string }>;
}) {
  const { stageId, sectionId } = await params;
  const data = await getParcoursSectionPlayData(stageId, sectionId);

  if (!data || !data.questions?.length) {
    return (
      <GameShell maxWidth="3xl">
        <div className="rounded-3xl border border-amber-200/60 bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-sm dark:border-amber-900/40 dark:bg-gray-900/70 dark:ring-white/10 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/25 to-orange-500/15 text-amber-800 ring-1 ring-amber-200/60 dark:text-amber-200 dark:ring-amber-900/40">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                Aucune question disponible
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Cette section n&apos;a pas encore de questions à jouer. Reviens
                plus tard ou retourne à la liste des sections.
              </p>
              <div className="mt-5">
                <GameBackLink href={`/fr/joueur/parcours/stage/${stageId}`}>
                  Retour aux sections
                </GameBackLink>
              </div>
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  const { section, jeu, questions } = data;

  return (
    <ParcoursSectionPlayView
      stageId={stageId}
      sectionId={section.id}
      section={section}
      jeu={jeu}
      questions={questions}
    />
  );
}
