"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import {
  GameBackLink,
  GameBadge,
  GameCardShell,
  GameMediaCard,
  GamePageHeader,
} from "@/components/game/GameUI";
import { GameShell } from "@/components/game/GameShell";

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
  const unlockedCount = sections.filter((s) => s.unlocked).length;

  return (
    <GameShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
        className="space-y-8"
      >
        <GameBackLink href={`/fr/joueur/nos-stages/stageId/${stageId}`}>
          {stageTitle}
        </GameBackLink>

        <GamePageHeader
          title={`Sections — ${stageTitle}`}
          subtitle="Choisis une section pour commencer le jeu. Les sections se débloquent une à une."
          badges={
            <>
              <GameBadge variant="muted">
                {sections.length} section{sections.length > 1 ? "s" : ""}
              </GameBadge>
              <GameBadge variant="amber">
                {unlockedCount} débloquée{unlockedCount > 1 ? "s" : ""}
              </GameBadge>
            </>
          }
          progress={{
            current: unlockedCount,
            total: sections.length,
            label: "Sections disponibles",
          }}
        />

        <motion.div
          className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {sections.map((section, index) => {
            const imageSrc = section.image?.startsWith("http")
              ? section.image
              : section.image || "/picintro.jpg";
            const remote = imageSrc.startsWith("http");

            const cardContent = (
              <>
                <GameMediaCard
                  imageSrc={imageSrc}
                  remote={remote}
                  alt={section.title}
                  badge={
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-sm font-bold text-white backdrop-blur-sm">
                        {index + 1}
                      </span>
                    </div>
                  }
                  overlay={
                    !section.unlocked ? (
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
                    {section.niveau}
                  </p>
                  <h2 className="mt-2 text-base font-bold leading-snug text-gray-900 sm:text-lg dark:text-white">
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
      </motion.div>
    </GameShell>
  );
}
