"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type NosStagesViewStage = {
  id: string;
  title: string;
  image: string | null;
  niveau: string;
  numOrder: number;
};

export type NosStagesViewActiveBook = {
  id: string;
  stageId: string | null;
  stageNiveau: string;
  stageAccomplished: boolean;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const gridContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

const gridItem = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

type Props = {
  stages: NosStagesViewStage[];
  activeBook: NosStagesViewActiveBook | null;
};

export function NosStagesView({ stages, activeBook }: Props) {
  const activeIndex = Math.max(
    0,
    stages.findIndex((s) => s.id === activeBook?.stageId),
  );
  const progressLabel =
    stages.length > 0 ? `${Math.min(activeIndex + 1, stages.length)}/${stages.length}` : "0/0";

  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.22),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.16),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.10),transparent_60%)] dark:bg-[radial-gradient(90%_60%_at_0%_20%,rgba(251,191,36,0.14),transparent_55%),radial-gradient(75%_45%_at_70%_0%,rgba(245,158,11,0.10),transparent_60%),radial-gradient(70%_55%_at_85%_75%,rgba(59,130,246,0.08),transparent_60%)]"
        aria-hidden
      />
      <div className="container mx-auto px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
          {/* Left: decorative image */}
          <motion.aside
            className="relative w-full shrink-0 lg:sticky lg:top-24 lg:w-[min(100%,380px)] xl:w-[min(100%,440px)]"
            initial={{ opacity: 0, x: -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
          >
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div
                className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-400/25 via-amber-200/10 to-transparent blur-2xl dark:from-amber-500/20 dark:via-amber-400/5"
                aria-hidden
              />
              <motion.div
                className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-b from-white to-amber-50/30 shadow-xl ring-1 ring-black/5 dark:border-amber-900/40 dark:from-gray-900 dark:to-gray-900/80 dark:ring-white/10"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
              >
                <div className="relative aspect-[4/5] w-full sm:aspect-[3/4] lg:aspect-[4/5]">
                  <Image
                    src="/stager.png"
                    alt="Décoration — parcours des stages"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 420px"
                    priority
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent"
                    aria-hidden
                  />
                </div>
              </motion.div>
            </div>
          </motion.aside>

          {/* Right: navigation + list */}
          <div className="min-w-0 flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: easeOut }}
            >
              <Link
                href="/fr/joueur"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-sm font-medium text-amber-900 shadow-sm transition hover:bg-amber-100/90 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                Retour
              </Link>
            </motion.div>

           

            <motion.div
              className="grid gap-5 sm:grid-cols-2 "
              variants={gridContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
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
                    <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
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
                          className={cn(
                            "object-cover transition-transform duration-700",
                            isActive ? "group-hover:scale-[1.05]" : "",
                          )}
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
                        />
                      )}
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent opacity-90",
                          isActive ? "opacity-80" : "opacity-95",
                        )}
                        aria-hidden
                      />

                      {isActive ? (
                        <div className="absolute left-3 top-3">
                          <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-white/95 px-3 py-1 text-xs font-semibold tracking-wide text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-gray-900/90 dark:text-amber-100">
                            En cours
                          </span>
                        </div>
                      ) : null}

                      {!isActive ? (
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
                        {stage.niveau}
                      </p>
                      <h2 className="mt-2 text-lg font-bold leading-snug text-gray-900 sm:text-xl dark:text-white">
                        {stage.title}
                      </h2>
                    </div>
                  </>
                );

                return (
                  <motion.div key={stage.id} variants={gridItem} className="h-full">
                    {isActive ? (
                      <Link
                        href={`/fr/joueur/nos-stages/stageId/${stage.id}`}
                        className={cn(
                          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200/70 bg-white/90 shadow-lg shadow-amber-900/10 ring-1 ring-black/5",
                          "transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/15",
                          "dark:border-amber-500/80 dark:bg-gray-800/95 dark:shadow-black/40",
                        )}
                      >
                        <div
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          aria-hidden
                        >
                          <div className="absolute -inset-24 bg-[radial-gradient(closest-side,rgba(251,191,36,0.30),transparent)] blur-2xl" />
                        </div>
                        {inner}
                      </Link>
                    ) : (
                      <div
                        className={cn(
                          "flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white/70 opacity-90",
                          "cursor-not-allowed grayscale-[0.35] dark:border-gray-700 dark:bg-gray-900/70",
                        )}
                      >
                        {inner}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
