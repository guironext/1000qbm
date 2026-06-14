"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { GameShell } from "@/components/game/GameShell";
import {
  GameBackLink,
  GameBadge,
  GameCardShell,
  GameMediaCard,
  GamePageHeader,
} from "@/components/game/GameUI";

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
  const completedCount = activeBook?.stageAccomplished
    ? stages.length
    : activeIndex + 1;

  return (
    <GameShell maxWidth="7xl">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-14">
        <motion.aside
          className="relative w-full shrink-0 lg:sticky lg:top-24 lg:w-[min(100%,360px)] xl:w-[min(100%,420px)]"
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: easeOut }}
        >
          <div className="relative mx-auto max-w-md lg:max-w-none">
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
              <div className="relative aspect-[21/9] w-full sm:aspect-[16/10] lg:aspect-[4/5]">
                <Image
                  src="/stager.png"
                  alt="Décoration — parcours des stages"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent lg:from-black/35"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                    1000 QBM
                  </p>
                  <p className="mt-1 text-lg font-bold text-white drop-shadow-sm">
                    Votre aventure biblique
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1 space-y-8">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: easeOut }}
          >
            <GameBackLink href="/fr/joueur">Retour</GameBackLink>

            <GamePageHeader
              title="Parcours des stages"
              subtitle="Avancez étape par étape. Seul le stage en cours est débloqué — terminez-le pour continuer l'aventure."
              badges={
                <>
                  <GameBadge variant="amber">
                    Stage {Math.min(activeIndex + 1, stages.length || 1)}
                  </GameBadge>
                  <GameBadge variant="muted">
                    {stages.length} stage{stages.length > 1 ? "s" : ""}
                  </GameBadge>
                </>
              }
              progress={{
                current: completedCount,
                total: stages.length,
                label: "Stages débloqués",
              }}
            />
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-2"
            variants={gridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {stages.map((stage, index) => {
              const isActive =
                activeBook &&
                stage.niveau === activeBook.stageNiveau &&
                stage.id === activeBook.stageId;
              const imageSrc = stage.image?.startsWith("http")
                ? stage.image
                : stage.image || "/picintro.jpg";
              const remote = imageSrc.startsWith("http");

              const cardContent = (
                <>
                  <GameMediaCard
                    imageSrc={imageSrc}
                    remote={remote}
                    alt={stage.title}
                    badge={
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-sm font-bold text-white backdrop-blur-sm">
                          {stage.numOrder || index + 1}
                        </span>
                        {isActive ? (
                          <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-white/95 px-3 py-1 text-xs font-semibold tracking-wide text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-gray-900/90 dark:text-amber-100">
                            En cours
                          </span>
                        ) : null}
                      </div>
                    }
                    overlay={
                      !isActive ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-800 shadow-md dark:bg-gray-900/95 dark:text-gray-100">
                            <Lock className="h-4 w-4" aria-hidden />
                            Verrouillé
                          </span>
                        </div>
                      ) : null
                    }
                  />
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                      {stage.niveau}
                    </p>
                    <h2 className="mt-2 text-base font-bold leading-snug text-gray-900 sm:text-lg lg:text-xl dark:text-white">
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
                      className="block h-full"
                    >
                      <GameCardShell interactive className="h-full">
                        {cardContent}
                      </GameCardShell>
                    </Link>
                  ) : (
                    <GameCardShell className="h-full">{cardContent}</GameCardShell>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </GameShell>
  );
}
