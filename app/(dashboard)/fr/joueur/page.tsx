"use client";

import React from "react";
import { startGameAction } from "@/lib/actions/playerActions";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-8 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto">
        {/* Image left + Text right */}
        <div className="flex flex-col md:flex-row items-stretch gap-8 w-full mb-10">
          {/* Left: Image */}
          <motion.div
            className="w-full md:w-1/2 relative group"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="relative aspect-[4/3] md:aspect-square w-full rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Image
                src="/picintro.jpg"
                alt="1000 QBM - Apprenez la Bible en jouant"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Right: Text content */}
          <motion.div
            className="w-full md:w-1/2 flex flex-col justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-8 md:p-10 h-full"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium mb-4"
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.span>
                Bienvenue sur 1000 QBM
              </motion.div>
              <motion.h1
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight"
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                Apprenez la Bible en jouant
              </motion.h1>
              <motion.p
                className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                Découvrez les récits, les personnages et les enseignements de la
                Bible à travers une aventure ludique et interactive.
              </motion.p>

              <motion.h2
                className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
                variants={fadeInUp}
                transition={{ duration: 0.4 }}
              >
                <GraduationCap className="w-5 h-5 text-amber-600" />
                Comment ce jeu vous aide à découvrir la Bible
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 space-y-4">
                {features.map((item) => (
                  <motion.div
                    key={item.title}
                    className="flex gap-3"
                    variants={fadeInUp}
                    transition={{ duration: 0.4 }}
                    whileHover={{ x: 4 }}
                  >
                    <motion.div
                      className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center"
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        transition: { type: "spring", stiffness: 400 },
                      }}
                    >
                      <item.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Button under the content */}
        <motion.form
          action={startGameAction}
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-md"
          >
            <Button
              type="submit"
              size="lg"
              className="w-full py-8 text-xl font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all duration-300 hover:shadow-2xl rounded-xl"
            >
              Commencer à jouer
            </Button>
          </motion.div>
          <motion.p
            className="mt-4 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Connectez-vous pour sauvegarder votre progression
          </motion.p>
        </motion.form>
      </div>
    </div>
  );
}