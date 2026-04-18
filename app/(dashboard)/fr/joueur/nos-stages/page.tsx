import React from "react";
import Link from "next/link";
import { getNosStagesListData } from "@/lib/actions/nosStagesActions";
import { NosStagesView } from "@/components/game/NosStagesView";

export default async function NosStagesPage() {
  const { stages, activeBook } = await getNosStagesListData();

  if (!activeBook && stages.length > 0) {
    return (
      <div className="min-h-[50vh] container mx-auto px-4 py-12 text-center">
        <p className="text-lg text-gray-700 dark:text-gray-200">
          Tous les stages sont terminés. Félicitations !
        </p>
        <Link
          href="/fr/joueur"
          className="mt-6 inline-block text-amber-700 hover:underline"
        >
          Retour à l&apos;accueil joueur
        </Link>
      </div>
    );
  }

  return <NosStagesView stages={stages} activeBook={activeBook} />;
}
