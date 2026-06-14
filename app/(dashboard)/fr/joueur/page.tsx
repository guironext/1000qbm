"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Trophy,
  Heart,
  GraduationCap,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameShell } from "@/components/game/GameShell";
import { GamePageHeader } from "@/components/game/GameUI";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: BookOpen,
    title: "Parcours structuré",
    desc: "Progressez par étapes et sections pour explorer la Bible de manière organisée.",
  },
  {
    icon: Gamepad2,
    title: "Quiz interactifs",
    desc: "Testez vos connaissances avec des questions variées.",
  },
  {
    icon: Trophy,
    title: "Suivi de progression",
    desc: "Suivez votre avancement et vos scores.",
  },
  {
    icon: Heart,
    title: "Apprentissage à votre rythme",
    desc: "Jouez quand vous voulez, où vous voulez.",
  },
];

export default function JoueurWelcomePage() {
  const router = useRouter();

  return (
    <GameShell maxWidth="6xl" contentClassName="flex flex-col justify-center">
      <div className="flex flex-col gap-8 lg:gap-10">
        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-amber-400/20 to-transparent blur-2xl"
              aria-hidden
            />
            <motion.div
              className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 sm:aspect-[16/10] lg:aspect-square"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <Image
                src="/picintro.jpg"
                alt="1000 QBM - Apprenez la Bible en jouant"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 540px"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                aria-hidden
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="order-1 flex flex-col justify-center lg:order-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/90 sm:p-8 lg:p-10"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.span>
                Bienvenue sur 1000 QBM
              </motion.div>

              <GamePageHeader
                title="Apprenez la Bible en jouant"
                subtitle="Découvrez les récits, les personnages et les enseignements de la Bible à travers une aventure ludique et interactive."
              />

              <motion.h2
                className="mb-4 mt-6 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl"
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                <GraduationCap className="h-5 w-5 text-amber-600" />
                Comment ce jeu vous aide
              </motion.h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((item) => (
                  <motion.div
                    key={item.title}
                    className="flex gap-3 rounded-2xl border border-amber-100/80 bg-amber-50/40 p-3 dark:border-amber-900/30 dark:bg-amber-950/20"
                    variants={fadeInUp}
                    transition={{ duration: 0.4 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                      <item.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-lg"
          >
            <Button
              type="button"
              size="lg"
              onClick={() => router.push("/fr/joueur/parcours")}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-7 text-lg font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:from-amber-600 hover:to-orange-700 hover:shadow-2xl sm:py-8 sm:text-xl"
            >
              Commencer à jouer
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </GameShell>
  );
}
