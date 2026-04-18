import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getNosStagesSectionPlayData } from "@/lib/actions/nosStagesActions";
import NosStagesSectionPlayClient from "@/components/joueur/NosStagesSectionPlayClient";

export default async function NosStagesSectionPlayPage({
  params,
}: {
  params: Promise<{ stageId: string; sectionId: string }>;
}) {
  const { stageId, sectionId } = await params;
  const data = await getNosStagesSectionPlayData(stageId, sectionId);

  if (!data || !data.questions?.length) {
    return (
      <div className="relative min-h-[70vh] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.18),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.12),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.08),transparent_60%)] dark:bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.08),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.06),transparent_60%)]"
          aria-hidden
        />
        <div className="container mx-auto px-4 py-10 sm:py-12">
          <div className="mx-auto max-w-3xl">
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
                    Cette section n’a pas encore de questions à jouer. Reviens
                    plus tard ou retourne à la liste des sections.
                  </p>
                  <div className="mt-5">
                    <Link
                      href={`/fr/joueur/nos-stages/stageId/${stageId}/sections`}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100/90 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      Retour aux sections
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { section, jeu, questions } = data;
  const imageSrc = section.image?.startsWith("http")
    ? section.image
    : section.image || "/picintro.jpg";
  const remote = imageSrc.startsWith("http");

  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.18),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.12),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.08),transparent_60%)] dark:bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.08),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.06),transparent_60%)]"
        aria-hidden
      />

      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4">
            <Link
              href={`/fr/joueur/nos-stages/stageId/${stageId}/sections`}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100/90 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Sections
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  {section.title}
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Réponds aux questions pour valider cette section.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {jeu?.niveau ? (
                  <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900 shadow-sm dark:border-amber-700/40 dark:bg-gray-900/70 dark:text-amber-200">
                    {jeu.niveau}
                  </span>
                ) : null}
                <span className="inline-flex items-center rounded-full border border-gray-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700/60 dark:bg-gray-900/60 dark:text-gray-200">
                  {questions.length} question{questions.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(280px,42%)_1fr] lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr]">
            <aside className="md:sticky md:top-24 md:self-start">
              <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-b from-white to-amber-50/30 shadow-xl ring-1 ring-black/5 dark:border-amber-900/40 dark:from-gray-900 dark:to-gray-900/80 dark:ring-white/10">
                <div className="relative aspect-[4/3] w-full">
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
                      sizes="(max-width: 1024px) 100vw, 460px"
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
      </div>
    </div>
  );
}
