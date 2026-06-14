"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, HelpCircle, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";
import ParcoursSectionPlayClient from "@/components/joueur/ParcoursSectionPlayClient";
import { GameShell } from "@/components/game/GameShell";
import {
  GameBackLink,
  GameBadge,
  GamePageHeader,
} from "@/components/game/GameUI";

type QuestionVM = {
  id: string;
  intitule: string;
  reponses: { id: string; intitule: string; isCorrect: boolean }[];
};

type Props = {
  stageId: string;
  sectionId: string;
  section: {
    id: string;
    title: string;
    image: string | null;
    numOrder: number;
  };
  jeu: { niveau: string };
  questions: QuestionVM[];
};

const easeOut = [0.22, 1, 0.36, 1] as const;

function sectionImageSrc(image: string | null) {
  if (image?.startsWith("http")) return image;
  return image || "/picintro.jpg";
}

function SessionRing({ count, size = 88 }: { count: number; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${count} question${count > 1 ? "s" : ""} dans cette session`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#section-play-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.12}
        />
        <defs>
          <linearGradient id="section-play-ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold tabular-nums text-amber-700 dark:text-amber-300">
          {count}
        </span>
        <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Q
        </span>
      </div>
    </div>
  );
}

function MobileInfoStrip({ questionCount }: { questionCount: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:hidden">
      <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-3.5 shadow-sm ring-1 ring-black/5 dark:border-amber-900/40 dark:bg-gray-900/70 dark:ring-white/10">
        <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-400">
          <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Session
        </p>
        <p className="mt-1.5 text-sm font-bold text-gray-900 dark:text-white">
          {questionCount} question{questionCount > 1 ? "s" : ""}
        </p>
      </div>
      <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-3.5 shadow-sm ring-1 ring-black/5 dark:border-amber-900/40 dark:bg-amber-950/25 dark:ring-white/10">
        <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-400">
          <Target className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Objectif
        </p>
        <p className="mt-1.5 text-sm font-bold text-gray-900 dark:text-white">
          ≥ 80&nbsp;% réussite
        </p>
      </div>
    </div>
  );
}

export function ParcoursSectionPlayView({
  stageId,
  sectionId,
  section,
  jeu,
  questions,
}: Props) {
  const imageSrc = sectionImageSrc(section.image);
  const remote = imageSrc.startsWith("http");
  const order = section.numOrder || 1;

  const badges = (
    <>
      {jeu?.niveau ? <GameBadge variant="amber">{jeu.niveau}</GameBadge> : null}
      <GameBadge variant="muted">
        {questions.length} question{questions.length > 1 ? "s" : ""}
      </GameBadge>
      <GameBadge variant="default">Section {order}</GameBadge>
    </>
  );

  return (
    <GameShell maxWidth="7xl">
      <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-14">
        <motion.aside
          className="relative w-full shrink-0 lg:sticky lg:top-24 lg:w-[min(100%,340px)] xl:w-[min(100%,380px)]"
          initial={{ opacity: 0, x: -36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: easeOut }}
        >
          <div className="relative mx-auto max-w-lg lg:max-w-none">
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
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 380px"
                    priority
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
                  aria-hidden
                />
                <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shadow-lg">
                    {order}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/95 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm dark:border-amber-800/50 dark:bg-gray-900/90 dark:text-amber-100">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    En cours
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  {jeu?.niveau ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                      {jeu.niveau}
                    </p>
                  ) : null}
                  <p className="mt-1 text-lg font-bold text-white drop-shadow-sm sm:text-xl lg:text-2xl">
                    {section.title}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-4 hidden space-y-4 lg:block"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
            >
              <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:border-amber-900/40 dark:bg-gray-900/70 dark:ring-white/10">
                <div className="flex items-center gap-4">
                  <SessionRing count={questions.length} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <BookOpen className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      Session de jeu
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        {questions.length}
                      </span>
                      {" question"}
                      {questions.length > 1 ? "s" : ""} à valider
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 shadow-sm ring-1 ring-black/5 dark:border-amber-900/40 dark:bg-amber-950/20 dark:ring-white/10">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-400">
                  <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Objectif
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  Obtenez au moins{" "}
                  <span className="font-bold text-amber-800 dark:text-amber-200">
                    80&nbsp;%
                  </span>{" "}
                  de bonnes réponses pour valider cette section.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1 space-y-5 sm:space-y-6 lg:space-y-8">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: easeOut }}
          >
            <GameBackLink href={`/fr/joueur/parcours/stage/${stageId}`}>
              Sections
            </GameBackLink>

            <div className="hidden lg:block">
              <GamePageHeader
                title={section.title}
                subtitle="Réponds aux questions pour valider cette section et continuer ton parcours."
                badges={badges}
              />
            </div>

            <div className="space-y-3 lg:hidden">
              <div className="flex flex-wrap gap-2">{badges}</div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Réponds aux questions pour valider cette section et continuer ton
                parcours.
              </p>
            </div>

            <MobileInfoStrip questionCount={questions.length} />
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: easeOut }}
          >
            <div
              className="pointer-events-none absolute -inset-1 rounded-[1.75rem] bg-gradient-to-r from-amber-400/20 via-orange-400/10 to-transparent blur-xl dark:from-amber-500/10"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white/70 shadow-xl ring-1 ring-black/5 backdrop-blur-sm dark:border-amber-900/40 dark:bg-gray-900/60 dark:ring-white/10 sm:rounded-3xl sm:p-1">
              <ParcoursSectionPlayClient
                stageId={stageId}
                sectionId={sectionId}
                jeuTitle={`Jeu — ${section.title}`}
                niveau={jeu.niveau}
                questions={questions}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </GameShell>
  );
}
