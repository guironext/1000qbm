import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { getGameboardPageData } from "@/lib/actions/boardActions";
import { cn } from "@/lib/utils";

export default async function StageGameboardPage() {
  const data = await getGameboardPageData();
  if (!data || !("sections" in data)) {
    return null;
  }
  const { stage, sections } = data;

  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          href="/fr/joueur/stage"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-wide text-amber-600 dark:text-amber-400">
            {stage.niveau}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {stage.title}
          </h1>
          {sections.length > 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-xl mx-auto">
              Clique sur une section sans cadenas pour lancer le jeu. Les autres
              s&apos;ouvrent une par une après chaque réussite (≥ 80&nbsp;%).
            </p>
          ) : null}
        </header>

        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300/60 bg-amber-50/50 dark:bg-amber-950/20 p-8 text-center space-y-3">
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              Aucune section n&apos;est liée à cette étape pour le moment.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Dans la base, renseignez soit{" "}
              <code className="text-xs bg-white/80 dark:bg-gray-800 px-1 rounded">
                Section.stageId
              </code>
              , soit des{" "}
              <code className="text-xs bg-white/80 dark:bg-gray-800 px-1 rounded">
                Jeu
              </code>{" "}
              avec ce{" "}
              <code className="text-xs bg-white/80 dark:bg-gray-800 px-1 rounded">
                stageId
              </code>{" "}
              et un{" "}
              <code className="text-xs bg-white/80 dark:bg-gray-800 px-1 rounded">
                sectionId
              </code>{" "}
              renseigné.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => {
            const src = s.image?.startsWith("http") ? s.image : s.image || "/picintro.jpg";
            const remote = src.startsWith("http");
            const inner = (
              <div
                className={cn(
                  "rounded-2xl overflow-hidden border bg-white/90 dark:bg-gray-800/90 shadow-lg transition-all",
                  s.unlocked
                    ? "border-amber-200 dark:border-amber-800 ring-2 ring-amber-400/30 hover:shadow-xl cursor-pointer"
                    : "border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed",
                )}
              >
                <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900">
                  {remote ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  )}
                  {!s.unlocked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                  )}
                  {s.completed && (
                    <div className="absolute top-2 right-2 rounded-full bg-green-500 text-white text-xs font-bold px-2 py-1">
                      OK
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Section {s.numOrder}
                  </p>
                </div>
              </div>
            );

            return s.unlocked ? (
              <Link
                key={s.id}
                href={`/fr/joueur/stage/section/${s.id}`}
                className="block"
              >
                {inner}
              </Link>
            ) : (
              <div key={s.id}>{inner}</div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
