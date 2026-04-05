import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { goToGameboardFromBravo } from "@/lib/actions/boardActions";
import { ArrowLeft } from "lucide-react";

export default async function SectionBravoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-12 flex flex-col items-center justify-center">
      <Link
        href="/fr/joueur/stage/gameboard"
        className="self-start mb-8 inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Tableau
      </Link>

      <div className="max-w-lg w-full text-center space-y-8 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 p-8 md:p-12">
        <div className="relative w-40 h-40 mx-auto shrink-0">
          <Image
            src="/happy.gif"
            alt=""
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-green-600">
            Bravo !
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Section validée. Passe à la suivante quand tu es prêt.
          </p>
        </div>

        <form action={goToGameboardFromBravo}>
          <Button
            type="submit"
            size="lg"
            className="w-full py-8 text-lg font-bold uppercase tracking-wide bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg"
          >
            Prochain Jeu
          </Button>
        </form>
      </div>
    </div>
  );
}
