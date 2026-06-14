import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { getNosStagesSectionPlayData } from "@/lib/actions/nosStagesActions";
import NosStagesSectionPlayClient from "@/components/joueur/NosStagesSectionPlayClient";
import { GameShell } from "@/components/game/GameShell";
import { GameBackLink, GameBadge, GamePageHeader } from "@/components/game/GameUI";

export default async function NosStagesSectionPlayPage({
  params,
}: {
  params: Promise<{ stageId: string; sectionId: string }>;
}) {
  const { stageId, sectionId } = await params;
  const data = await getNosStagesSectionPlayData(stageId, sectionId);

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
                <GameBackLink href={`/fr/joueur/nos-stages/stageId/${stageId}/sections`}>
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
  const imageSrc = section.image?.startsWith("http")
    ? section.image
    : section.image || "/picintro.jpg";
  const remote = imageSrc.startsWith("http");

  return (
    <GameShell>
      <div className="space-y-6 lg:space-y-8">
        <div className="space-y-4">
          <GameBackLink href={`/fr/joueur/nos-stages/stageId/${stageId}/sections`}>
            Sections
          </GameBackLink>

          <GamePageHeader
            title={section.title}
            subtitle="Réponds aux questions pour valider cette section."
            badges={
              <>
                {jeu?.niveau ? (
                  <GameBadge variant="amber">{jeu.niveau}</GameBadge>
                ) : null}
                <GameBadge variant="muted">
                  {questions.length} question{questions.length > 1 ? "s" : ""}
                </GameBadge>
              </>
            }
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(260px,38%)_1fr] lg:gap-8 xl:grid-cols-[420px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-b from-white to-amber-50/30 shadow-xl ring-1 ring-black/5 dark:border-amber-900/40 dark:from-gray-900 dark:to-gray-900/80 dark:ring-white/10">
              <div className="relative aspect-[16/10] w-full lg:aspect-[4/3]">
                {remote ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt={section.title ?? ""}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={imageSrc}
                    alt={section.title ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 420px"
                    priority
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent"
                  aria-hidden
                />
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <NosStagesSectionPlayClient
              stageId={stageId}
              sectionId={section.id}
              jeuTitle={`Jeu — ${section.title}`}
              niveau={jeu.niveau}
              questions={questions}
            />
          </main>
        </div>
      </div>
    </GameShell>
  );
}
