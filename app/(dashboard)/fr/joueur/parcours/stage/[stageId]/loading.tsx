import React from "react";
import { GameShell } from "@/components/game/GameShell";

export default function ParcoursStageLoading() {
  return (
    <GameShell maxWidth="7xl">
      <div className="animate-pulse space-y-8">
        <div className="h-9 w-32 rounded-full bg-amber-200/60 dark:bg-amber-900/40" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 max-w-md rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-full max-w-xl rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-16 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    </GameShell>
  );
}
