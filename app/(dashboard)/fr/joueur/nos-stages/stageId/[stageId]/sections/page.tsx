import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getNosStagesSectionsListData } from "@/lib/actions/nosStagesActions";
import { cn } from "@/lib/utils";

export default async function NosStagesSectionsPage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;
  const { stage, sections } = await getNosStagesSectionsListData(stageId);

  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          href={`/fr/joueur/nos-stages/stageId/${stageId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {stage.title}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sections — {stage.title}
        </h1>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => {
            const imageSrc = section.image?.startsWith("http")
              ? section.image
              : section.image || "/picintro.jpg";
            const remote = imageSrc.startsWith("http");

            const inner = (
              <>
                <div className="relative h-36 w-full bg-gray-100 dark:bg-gray-900">
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
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  )}
                  {!section.unlocked ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded">
                        Verrouillé
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    {section.niveau}
                  </p>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
              </>
            );

            return section.unlocked ? (
              <Link
                key={section.id}
                href={`/fr/joueur/nos-stages/stageId/${stageId}/sectionId/${section.id}`}
                className={cn(
                  "rounded-xl overflow-hidden border border-amber-300 dark:border-amber-700",
                  "bg-white/90 dark:bg-gray-800/90 shadow-md hover:shadow-lg transition-shadow",
                )}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={section.id}
                className={cn(
                  "rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700",
                  "opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50",
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
