import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default function FelicitationPage() {
  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-12 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full text-center space-y-8 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 p-8 md:p-12">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 p-6">
            <Trophy className="w-16 h-16 text-amber-600" />
          </div>
        </div>
        <div className="relative w-48 h-48 mx-auto shrink-0">
          <Image src="/happy.gif" alt="" fill className="object-contain" unoptimized />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Parcours terminé !
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Tu as validé toutes les étapes disponibles. Merci d&apos;avoir joué.
        </p>
        <Button asChild size="lg" className="w-full rounded-xl py-8 text-lg font-bold">
          <Link href="/fr/joueur">Retour à l&apos;accueil joueur</Link>
        </Button>
      </div>
    </div>
  );
}
