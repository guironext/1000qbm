import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Aucune question disponible pour cette section.
        </p>
        <Link
          href={`/fr/joueur/nos-stages/stageId/${stageId}/sections`}
          className="mt-4 inline-block text-amber-700 hover:underline"
        >
          Retour aux sections
        </Link>
      </div>
    );
  }

  const { section, jeu, questions } = data;
  const imageSrc = section.image?.startsWith("http")
    ? section.image
    : section.image || "/picintro.jpg";
  const remote = imageSrc.startsWith("http");

  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href={`/fr/joueur/nos-stages/stageId/${stageId}/sections`}
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Sections
        </Link>

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {section.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-white/50 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 lg:sticky lg:top-24">
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
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            )}
          </div>

          <NosStagesSectionPlayClient
            stageId={stageId}
            sectionId={section.id}
            jeuTitle={`Jeu — ${section.title}`}
            niveau={jeu.niveau}
            questions={questions}
          />
        </div>
      </div>
    </div>
  );
}
