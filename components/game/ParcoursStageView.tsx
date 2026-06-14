"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Lock,
  Map,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  GameBackLink,
  GameBadge,
  GameCardShell,
  GamePageHeader,
} from "@/components/game/GameUI";
import { GameShell } from "@/components/game/GameShell";
import { cn } from "@/lib/utils";

export type ParcoursStageSection = {
  id: string;
  title: string;
  niveau: string;
  image: string | null;
  numOrder: number;
  unlocked: boolean;
  isActive: boolean;
  isCompleted: boolean;
};

type Props = {
  stageId: string;
  stageTitle: string;
  stageNiveau: string;
  stageImage: string | null;
  sections: ParcoursStageSection[];
  playableCount: number;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

function stageImageSrc(image: string | null) {
  if (image?.startsWith("http")) return image;
  return image || "/picintro.jpg";
}

function sectionImageSrc(image: string | null) {
  if (image?.startsWith("http")) return image;
  return image || "/picintro.jpg";
}

function ProgressRing({
  current,
  total,
  size = 88,
}: {
  current: number;
  total: number;
  size?: number;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% des sections terminées`}
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
          stroke="url(#stage-sections-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="stage-sections-ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold tabular-nums text-amber-700 dark:text-amber-300">
          {pct}%
        </span>
      </div>
    </div>
  );
}

function ProgressCard({
  completedCount,
  total,
  className,
}: {
  completedCount: number;
  total: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-200/60 bg-white/80 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:border-amber-900/40 dark:bg-gray-900/70 dark:ring-white/10 sm:p-5",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <ProgressRing current={completedCount} total={Math.max(total, 1)} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Map className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            Progression du stage
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-bold text-amber-700 dark:text-amber-300">
              {completedCount}
            </span>
            {" / "}
            {total} section{total > 1 ? "s" : ""} terminée
            {completedCount > 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeaturedActiveSection({
  stageId,
  section,
}: {
  stageId: string;
  section: ParcoursStageSection;
}) {
  const imageSrc = sectionImageSrc(section.image);
  const remote = imageSrc.startsWith("http");
  const href = `/fr/joueur/parcours/stage/${stageId}/section/${section.id}`;

  return (
    <motion.div variants={fadeUp} className="relative">
      <div
        className="pointer-events-none absolute -inset-1 rounded-[1.75rem] bg-gradient-to-r from-amber-400/30 via-orange-400/20 to-amber-300/10 blur-xl dark:from-amber-500/25 dark:via-orange-500/15"
        aria-hidden
      />
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-3xl border border-amber-300/70 bg-white text-left shadow-xl ring-1 ring-amber-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-amber-900/15 dark:border-amber-600/50 dark:bg-gray-900 dark:ring-amber-400/30"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-[16/10] w-full shrink-0 sm:aspect-auto sm:w-[min(100%,240px)] md:w-[min(100%,280px)]">
            {remote ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={section.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <Image
                src={imageSrc}
                alt={section.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, 280px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-black/20" />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shadow-lg">
                {section.numOrder}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/95 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm dark:border-amber-800/50 dark:bg-gray-900/90 dark:text-amber-100">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                En cours
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                {section.niveau}
              </p>
              <h2 className="mt-2 text-lg font-extrabold leading-tight text-gray-900 sm:text-xl dark:text-white">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Continuez cette section pour avancer dans le stage.
              </p>
            </div>
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-amber-500/25 transition group-hover:from-amber-600 group-hover:to-orange-700 sm:w-fit">
              Jouer la section
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SectionListItem({
  stageId,
  section,
  isLast,
}: {
  stageId: string;
  section: ParcoursStageSection;
  isLast: boolean;
}) {
  const imageSrc = sectionImageSrc(section.image);
  const remote = imageSrc.startsWith("http");
  const href = `/fr/joueur/parcours/stage/${stageId}/section/${section.id}`;

  const cardInner = (
    <GameCardShell
      interactive={section.unlocked}
      className={cn(
        "overflow-hidden transition duration-300",
        section.isCompleted &&
          section.unlocked &&
          "border-emerald-200/70 dark:border-emerald-700/50",
        section.unlocked &&
          !section.isCompleted &&
          "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-900/10",
      )}
    >
      <div className="flex flex-row">
        <div className="relative h-auto w-20 shrink-0 sm:w-28 md:w-32">
          {remote ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={section.title}
              className="h-full min-h-[4.75rem] w-full object-cover sm:min-h-[5.5rem]"
            />
          ) : (
            <div className="relative min-h-[4.75rem] w-full sm:min-h-[5.5rem]">
              <Image
                src={imageSrc}
                alt={section.title}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}
          {!section.unlocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
              <Lock className="h-5 w-5 text-white/90" aria-hidden />
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 p-3.5 sm:gap-3 sm:p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400 sm:text-xs">
                {section.niveau}
              </p>
              {section.isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  Validée
                </span>
              ) : null}
            </div>
            <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-gray-900 sm:text-base dark:text-white">
              {section.title}
            </h2>
            {!section.unlocked ? (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Terminez la section précédente
              </p>
            ) : null}
          </div>

          {section.unlocked ? (
            <ChevronRight
              className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </GameCardShell>
  );

  return (
    <motion.li variants={fadeUp} className="relative flex gap-3 sm:gap-5">
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold sm:h-10 sm:w-10 sm:text-sm",
            section.isCompleted &&
              "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
            !section.unlocked &&
              "border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400",
            section.unlocked &&
              !section.isCompleted &&
              "border-amber-300 bg-white text-amber-800 dark:border-amber-700 dark:bg-gray-900 dark:text-amber-200",
          )}
        >
          {section.isCompleted ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          ) : (
            section.numOrder
          )}
        </span>
        {!isLast ? (
          <div
            className="mt-1 w-0.5 min-h-[1.5rem] flex-1 bg-gradient-to-b from-amber-300/80 to-amber-200/40 dark:from-amber-700/60 dark:to-gray-700 sm:min-h-[2rem]"
            aria-hidden
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-4 sm:pb-6">
        {section.unlocked ? (
          <Link href={href} className="block">
            {cardInner}
          </Link>
        ) : (
          cardInner
        )}
      </div>
    </motion.li>
  );
}

export function ParcoursStageView({
  stageId,
  stageTitle,
  stageNiveau,
  stageImage,
  sections,
  playableCount,
}: Props) {
  const completedCount = sections.filter((s) => s.isCompleted).length;
  const activeSection = sections.find((s) => s.isActive && s.unlocked) ?? null;
  const listSections = activeSection
    ? sections.filter((s) => s.id !== activeSection.id)
    : sections;
  const imageSrc = stageImageSrc(stageImage);
  const remote = imageSrc.startsWith("http");

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
                    alt={stageTitle}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <Image
                    src={imageSrc}
                    alt={stageTitle}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 380px"
                    priority
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                    {stageNiveau}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white drop-shadow-sm sm:text-xl lg:text-2xl">
                    {stageTitle}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-4 hidden lg:block"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
            >
              <ProgressCard
                completedCount={completedCount}
                total={sections.length}
              />
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
            <GameBackLink href="/fr/joueur/parcours">Votre parcours</GameBackLink>

            <div className="hidden sm:block">
              <GamePageHeader
                title={stageTitle}
                subtitle="Avancez section par section. Terminez chaque session pour débloquer la suivante."
                badges={
                  <>
                    <GameBadge variant="amber">{stageNiveau}</GameBadge>
                    <GameBadge variant="muted">
                      {sections.length} section{sections.length > 1 ? "s" : ""}
                    </GameBadge>
                    {completedCount > 0 ? (
                      <GameBadge variant="default">
                        {completedCount} terminée{completedCount > 1 ? "s" : ""}
                      </GameBadge>
                    ) : null}
                  </>
                }
                progress={{
                  current: completedCount,
                  total: Math.max(sections.length, 1),
                  label: "Sections terminées",
                }}
              />
            </div>

            <div className="space-y-3 sm:hidden">
              <div className="flex flex-wrap gap-2">
                <GameBadge variant="amber">{stageNiveau}</GameBadge>
                <GameBadge variant="muted">
                  {sections.length} section{sections.length > 1 ? "s" : ""}
                </GameBadge>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Avancez section par section pour débloquer la suite.
              </p>
            </div>

            <ProgressCard
              completedCount={completedCount}
              total={sections.length}
              className="lg:hidden"
            />
          </motion.div>

          {sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300/70 bg-amber-50/40 p-8 text-center dark:border-amber-800/50 dark:bg-amber-950/20">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                Aucune section n&apos;est configurée pour ce stage.
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Contactez un administrateur ou revenez plus tard.
              </p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {activeSection ? (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-400">
                    Section en cours
                  </h2>
                  <FeaturedActiveSection
                    stageId={stageId}
                    section={activeSection}
                  />
                </div>
              ) : null}

              {listSections.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">
                      {activeSection ? "Autres sections" : "Toutes les sections"}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {listSections.length} section
                      {listSections.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  <motion.ol
                    className="space-y-0"
                    variants={listContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {listSections.map((section, index) => (
                      <SectionListItem
                        key={section.id}
                        stageId={stageId}
                        section={section}
                        isLast={index === listSections.length - 1}
                      />
                    ))}
                  </motion.ol>
                </div>
              ) : null}
            </div>
          )}

          {sections.length > 0 && playableCount === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Aucune section disponible pour le moment.
            </p>
          ) : null}
        </div>
      </div>
    </GameShell>
  );
}
