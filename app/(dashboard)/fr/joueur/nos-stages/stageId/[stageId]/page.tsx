import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getNosStagesStageIntroData } from "@/lib/actions/nosStagesActions";
import { GameShell } from "@/components/game/GameShell";
import { GameBackLink, GameBadge } from "@/components/game/GameUI";

export default async function NosStagesStageIntroPage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;
  const { stage } = await getNosStagesStageIntroData(stageId);

  const imageSrc = stage.image?.startsWith("http")
    ? stage.image
    : stage.image || "/picintro.jpg";
  const remote = imageSrc.startsWith("http");

  const descriptionText =
    stage.descriptions?.map((d) => d.texte).join("\n\n") ?? "";

  return (
    <GameShell maxWidth="5xl">
      <div className="space-y-6">
        <GameBackLink href="/fr/joueur/nos-stages">Nos stages</GameBackLink>

        <article className="overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-xl ring-1 ring-black/5 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/90 dark:ring-white/10">
          <div className="flex flex-col md:flex-row md:items-stretch">
            <div className="relative aspect-[16/10] w-full shrink-0 bg-gray-100 dark:bg-gray-900 md:w-[42%] md:min-h-[300px]">
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
                  priority
                  sizes="(max-width: 768px) 100vw, 360px"
                />
              )}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10"
                aria-hidden
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col space-y-6 p-6 sm:p-8 md:p-10">
              <header className="space-y-3">
                <GameBadge variant="amber">{stage.niveau}</GameBadge>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  {stage.title}
                </h1>
              </header>

              {descriptionText ? (
                <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-200">
                  {descriptionText}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Prêt à commencer ce stage ?
                </p>
              )}

              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-7 text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-orange-700 sm:py-8 sm:text-lg"
                >
                  <Link href={`/fr/joueur/nos-stages/stageId/${stageId}/sections`}>
                    Commençons ce stage
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </GameShell>
  );
}
