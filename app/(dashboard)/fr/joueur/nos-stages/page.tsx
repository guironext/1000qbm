import React from "react";
import { Trophy } from "lucide-react";
import { getNosStagesListData } from "@/lib/actions/nosStagesActions";
import { NosStagesView } from "@/components/game/NosStagesView";
import { GameShell } from "@/components/game/GameShell";
import { GameBackLink } from "@/components/game/GameUI";

export default async function NosStagesPage() {
  const { stages, activeBook } = await getNosStagesListData();

  if (!activeBook && stages.length > 0) {
    return (
      <GameShell maxWidth="3xl">
        <div className="rounded-3xl border border-amber-200/60 bg-white/80 p-8 text-center shadow-xl ring-1 ring-black/5 backdrop-blur-sm dark:border-amber-900/40 dark:bg-gray-900/70 dark:ring-white/10 sm:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40">
            <Trophy className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Félicitations !
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Tous les stages sont terminés. Bravo pour votre parcours !
          </p>
          <div className="mt-6">
            <GameBackLink href="/fr/joueur">Retour à l&apos;accueil joueur</GameBackLink>
          </div>
        </div>
      </GameShell>
    );
  }

  return <NosStagesView stages={stages} activeBook={activeBook} />;
}
