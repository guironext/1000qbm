"use client";

import React from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { ChevronRight, Lock, Loader2, Map, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { commenceParcoursStage } from "@/lib/actions/parcoursActions";
import { GameShell } from "@/components/game/GameShell";
import {
  GameBackLink,
  GameBadge,
  GameCardShell,
  GameMediaCard,
  GamePageHeader,
} from "@/components/game/GameUI";
import { cn } from "@/lib/utils";

export type ParcoursViewStage = {
  id: string;
  title: string;
  image: string | null;
  niveau: string;
  numOrder: number;
};

type Props = {
  stages: ParcoursViewStage[];
  activeStageId: string | null;
  activeStageNiveau: string;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

function isStageActive(
  stage: ParcoursViewStage,
  activeStageId: string | null,
  activeStageNiveau: string,
) {
  if (activeStageId) return stage.id === activeStageId;
  return (
    stage.niveau === activeStageNiveau ||
    stage.niveau === "Stage 1" ||
    stage.niveau === "1"
  );
}

function formatNiveau(niveau: string) {
  return niveau.startsWith("Stage") ? niveau : `Stage ${niveau}`;
}

function stageImageSrc(stage: ParcoursViewStage) {
  if (stage.image?.startsWith("http")) return stage.image;
  return stage.image || "/picintro.jpg";
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
      aria-label={`${pct}% du parcours débloqué`}
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
          stroke="url(#parcours-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="parcours-ring" x1="0%" y1="0%" x2="100%" y2="0%">
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

function CommenceStageSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-600 hover:to-orange-700 disabled:opacity-70 sm:w-fit sm:px-6"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Préparation…
        </>
      ) : (
        <>
          Continuer l&apos;aventure
          <ChevronRight className="h-4 w-4" aria-hidden />
        </>
      )}
    </button>
  );
}

function FeaturedActiveStage({
  stage,
  index,
}: {
  stage: ParcoursViewStage;
  index: number;
}) {
  const imageSrc = stageImageSrc(stage);
  const remote = imageSrc.startsWith("http");
  const commenceAction = commenceParcoursStage.bind(null, stage.id);

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <div
        className="pointer-events-none absolute -inset-1 rounded-[1.75rem] bg-gradient-to-r from-amber-400/30 via-orange-400/20 to-amber-300/10 blur-xl dark:from-amber-500/25 dark:via-orange-500/15"
        aria-hidden
      />
      <form
        action={commenceAction}
        className="group relative block w-full overflow-hidden rounded-3xl border border-amber-300/70 bg-white text-left shadow-xl ring-1 ring-amber-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-amber-900/15 dark:border-amber-600/50 dark:bg-gray-900 dark:ring-amber-400/30"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-[16/10] w-full shrink-0 sm:aspect-auto sm:w-[min(100%,280px)] md:w-[min(100%,320px)]">
            {remote ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={stage.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <Image
                src={imageSrc}
                alt={stage.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, 320px"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-black/20" />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shadow-lg">
                {stage.numOrder || index + 1}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-white/95 px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm dark:border-amber-800/50 dark:bg-gray-900/90 dark:text-amber-100">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                En cours
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-5 sm:p-6 md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                {formatNiveau(stage.niveau)}
              </p>
              <h2 className="mt-2 text-xl font-extrabold leading-tight text-gray-900 sm:text-2xl dark:text-white">
                {stage.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                Reprenez votre aventure là où vous vous êtes arrêté et
                continuez à explorer la Bible.
              </p>
            </div>
            <CommenceStageSubmitButton />
          </div>
        </div>
      </form>
    </motion.section>
  );
}

function LockedStageCard({
  stage,
  index,
  isLast,
}: {
  stage: ParcoursViewStage;
  index: number;
  isLast: boolean;
}) {
  const imageSrc = stageImageSrc(stage);
  const remote = imageSrc.startsWith("http");
  const order = stage.numOrder || index + 1;

  return (
    <motion.li variants={fadeUp} className="relative flex gap-4 sm:gap-5">
      <div className="relative flex flex-col items-center">
        <span
          className={cn(
            "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
            "border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400",
          )}
        >
          {order}
        </span>
        {!isLast ? (
          <div
            className="mt-1 w-0.5 flex-1 min-h-[2rem] bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"
            aria-hidden
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-6 sm:pb-8">
        <GameCardShell className="overflow-hidden">
          <div className="flex flex-row">
            <div className="relative h-auto w-24 shrink-0 sm:w-32">
              {remote ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt={stage.title}
                  className="h-full min-h-[5.5rem] w-full object-cover"
                />
              ) : (
                <div className="relative min-h-[5.5rem] w-full">
                  <Image
                    src={imageSrc}
                    alt={stage.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
                <Lock className="h-5 w-5 text-white/90" aria-hidden />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 sm:text-xs">
                {formatNiveau(stage.niveau)}
              </p>
              <h3 className="mt-1 text-sm font-bold leading-snug text-gray-800 sm:text-base dark:text-gray-100">
                {stage.title}
              </h3>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Terminez le stage précédent pour débloquer
              </p>
            </div>
          </div>
        </GameCardShell>
      </div>
    </motion.li>
  );
}

function LockedStageGridCard({
  stage,
  index,
}: {
  stage: ParcoursViewStage;
  index: number;
}) {
  const imageSrc = stageImageSrc(stage);
  const remote = imageSrc.startsWith("http");

  return (
    <motion.div variants={fadeUp} className="h-full">
      <GameCardShell className="h-full">
        <GameMediaCard
          imageSrc={imageSrc}
          remote={remote}
          alt={stage.title}
          badge={
            <div className="absolute left-3 top-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-sm font-bold text-white backdrop-blur-sm">
                {stage.numOrder || index + 1}
              </span>
            </div>
          }
          overlay={
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-800 shadow-md dark:bg-gray-900/95 dark:text-gray-100">
                <Lock className="h-4 w-4" aria-hidden />
                Verrouillé
              </span>
            </div>
          }
        />
        <div className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            {formatNiveau(stage.niveau)}
          </p>
          <h3 className="mt-2 text-base font-bold leading-snug text-gray-800 sm:text-lg dark:text-gray-100">
            {stage.title}
          </h3>
        </div>
      </GameCardShell>
    </motion.div>
  );
}

export function ParcoursView({
  stages,
  activeStageId,
  activeStageNiveau,
}: Props) {
  const activeIndex = Math.max(
    0,
    stages.findIndex((s) =>
      isStageActive(s, activeStageId, activeStageNiveau),
    ),
  );
  const unlockedCount = Math.min(activeIndex + 1, stages.length);
  const activeStage = stages[activeIndex] ?? null;
  const lockedStages = stages.filter(
    (s) => !isStageActive(s, activeStageId, activeStageNiveau),
  );

  return (
    <GameShell maxWidth="7xl">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-14">
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
                <Image
                  src="/stager.png"
                  alt="Décoration — parcours des stages"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 380px"
                  priority
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                    1000 QBM
                  </p>
                  <p className="mt-1 text-lg font-bold text-white drop-shadow-sm sm:text-xl">
                    Votre parcours biblique
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-5 hidden rounded-2xl border border-amber-200/60 bg-white/80 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:border-amber-900/40 dark:bg-gray-900/70 dark:ring-white/10 lg:block"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
            >
              <div className="flex items-center gap-4">
                <ProgressRing
                  current={unlockedCount}
                  total={stages.length || 1}
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <Map className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    Progression globale
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-bold text-amber-700 dark:text-amber-300">
                      {unlockedCount}
                    </span>
                    {" / "}
                    {stages.length} stage{stages.length > 1 ? "s" : ""}{" "}
                    débloqué{unlockedCount > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1 space-y-8 lg:space-y-10">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: easeOut }}
          >
            <GameBackLink href="/fr/joueur">Retour</GameBackLink>

            <GamePageHeader
              title="Votre parcours"
              subtitle="Découvrez tous les stages. Seul le Stage 1 est débloqué pour commencer l'aventure."
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
                current: unlockedCount,
                total: stages.length,
                label: "Stages débloqués",
              }}
            />
          </motion.div>

          {stages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-amber-300/70 bg-amber-50/40 p-8 text-center dark:border-amber-800/50 dark:bg-amber-950/20"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Aucun stage disponible pour le moment.
              </p>
            </motion.div>
          ) : (
            <>
              {activeStage ? (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-400">
                    Stage en cours
                  </h2>
                  <FeaturedActiveStage stage={activeStage} index={activeIndex} />
                </div>
              ) : null}

              {lockedStages.length > 0 ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-600 dark:text-gray-400">
                      Prochaines étapes
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {lockedStages.length} stage
                      {lockedStages.length > 1 ? "s" : ""} à débloquer
                    </p>
                  </div>

                  {/* Timeline list — mobile & tablet portrait */}
                  <motion.ol
                    className="space-y-0 md:hidden"
                    variants={listContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                  >
                    {lockedStages.map((stage, i) => (
                      <LockedStageCard
                        key={stage.id}
                        stage={stage}
                        index={stages.indexOf(stage)}
                        isLast={i === lockedStages.length - 1}
                      />
                    ))}
                  </motion.ol>

                  {/* Grid — tablet landscape & desktop */}
                  <motion.div
                    className="hidden gap-5 md:grid md:grid-cols-2"
                    variants={listContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                  >
                    {lockedStages.map((stage) => (
                      <LockedStageGridCard
                        key={stage.id}
                        stage={stage}
                        index={stages.indexOf(stage)}
                      />
                    ))}
                  </motion.div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </GameShell>
  );
}
