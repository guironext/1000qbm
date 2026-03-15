"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function CommenconsButton() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push("/fr/joueur/stage/section")}
      className="group relative mt-8 w-full sm:w-auto overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 px-8 py-4 text-xl font-bold text-white shadow-[0_4px_14px_0_rgba(180,83,9,0.4)] transition-shadow duration-300 hover:shadow-[0_8px_25px_-5px_rgba(180,83,9,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shine overlay on hover */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

      <span className="relative flex items-center justify-center gap-2">
        Commençons
        <ChevronRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </motion.button>
  );
}
