"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionVM = {
  id: string;
  title: string;
  niveau: string;
  unlocked: boolean;
  image: string | null;
};

type Props = {
  stageId: string;
  stageTitle: string;
  sections: SectionVM[];
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export default function NosStagesSectionsViewClient({
  stageId,
  stageTitle,
  sections,
}: Props) {
  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.18),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.12),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.08),transparent_60%)] dark:bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.08),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.06),transparent_60%)]"
        aria-hidden
      />

      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="flex flex-col gap-4"
          >
            <Link
              href={`/fr/joueur/nos-stages/stageId/${stageId}`}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100/90 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {stageTitle}
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  Sections — {stageTitle}
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Choisis une section pour commencer le jeu.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-gray-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700/60 dark:bg-gray-900/60 dark:text-gray-200">
                  {sections.length} section{sections.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
          >
            {sections.map((section) => {
              const imageSrc = section.image?.startsWith("http")
                ? section.image
                : section.image || "/picintro.jpg";
              const remote = imageSrc.startsWith("http");

              const cardInner = (
                <>
                  <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    {remote ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSrc}
                        alt={section.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={imageSrc}
                        alt={section.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                      />
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-95"
                      aria-hidden
                    />

                    {!section.unlocked ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-800 shadow-md dark:bg-gray-900/95 dark:text-gray-100">
                          <Lock className="h-4 w-4" aria-hidden />
                          Verrouillé
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                      {section.niveau}
                    </p>
                    <h2 className="mt-2 text-lg font-bold leading-snug text-gray-900 sm:text-xl dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                </>
              );

              return (
                <motion.div key={section.id} variants={item} className="h-full">
                  {section.unlocked ? (
                    <Link
                      href={`/fr/joueur/nos-stages/stageId/${stageId}/sectionId/${section.id}`}
                      className={cn(
                        "group relative flex h-full flex-col overflow-hidden rounded-2xl",
                        "border border-amber-200/70 bg-white/90 shadow-lg shadow-amber-900/10 ring-1 ring-black/5",
                        "transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/15",
                        "dark:border-amber-500/60 dark:bg-gray-800/90 dark:shadow-black/40",
                      )}
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        aria-hidden
                      >
                        <div className="absolute -inset-24 bg-[radial-gradient(closest-side,rgba(251,191,36,0.28),transparent)] blur-2xl" />
                      </div>
                      {cardInner}
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        "flex h-full flex-col overflow-hidden rounded-2xl",
                        "border border-gray-200/90 bg-white/70 opacity-90",
                        "cursor-not-allowed grayscale-[0.35] dark:border-gray-700 dark:bg-gray-900/60",
                      )}
                    >
                      {cardInner}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

