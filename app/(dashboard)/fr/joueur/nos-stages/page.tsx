import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getNosStagesListData } from "@/lib/actions/nosStagesActions";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          href="/fr/joueur"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nos stages
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Seul le stage en cours est disponible. Terminez chaque stage pour
            débloquer le suivant.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage) => {
            const isActive =
              activeBook &&
              stage.niveau === activeBook.stageNiveau &&
              stage.id === activeBook.stageId;
            const imageSrc = stage.image?.startsWith("http")
              ? stage.image
              : stage.image || "/picintro.jpg";
            const remote = imageSrc.startsWith("http");

            const inner = (
              <>
                <div className="relative aspect-[16/10] w-full bg-gray-100 dark:bg-gray-900">
                  {remote ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageSrc}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={imageSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                  )}
                  {!isActive ? (
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                      <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800">
                        Verrouillé
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    {stage.niveau}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {stage.title}
                  </h2>
                </div>
              </>
            );

            return isActive ? (
              <Link
                key={stage.id}
                href={`/fr/joueur/nos-stages/stageId/${stage.id}`}
                className={cn(
                  "rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg",
                  "bg-white/90 dark:bg-gray-800/90 transition-transform hover:scale-[1.01]",
                )}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={stage.id}
                className={cn(
                  "rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700",
                  "bg-white/60 dark:bg-gray-900/60 opacity-80 cursor-not-allowed",
                )}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
