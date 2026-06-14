"use client";

import React from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBackLink } from "@/components/game/GameUI";

export default function ParcoursStageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <GameShell maxWidth="3xl">
      <div className="rounded-2xl border border-red-200/70 bg-white/90 p-6 shadow-lg dark:border-red-900/40 dark:bg-gray-900/80 sm:p-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Impossible de charger ce stage
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {error.message || "Une erreur est survenue."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Réessayer
          </button>
          <GameBackLink href="/fr/joueur/parcours">Retour au parcours</GameBackLink>
        </div>
      </div>
    </GameShell>
  );
}
