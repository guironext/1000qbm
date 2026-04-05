import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { commenceGame, getStagePageData } from "@/lib/actions/boardActions";
import { Button } from "@/components/ui/button";

export default async function StagePage() {
  const { stage } = await getStagePageData();

  const imageSrc = stage.image?.startsWith("http")
    ? stage.image
    : stage.image || "/picintro.jpg";
  const isRemoteImage = imageSrc.startsWith("http");

  return (
    <div className="min-h-[70vh] container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link
          href="/fr/joueur"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 overflow-hidden flex flex-col md:flex-row md:items-stretch">
          <div className="relative aspect-[16/10] w-full md:w-[42%] md:min-h-[280px] lg:min-h-[320px] shrink-0 bg-gray-100 dark:bg-gray-900">
            {isRemoteImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL may be any host; not all are in next.config remotePatterns
              <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={imageSrc}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 360px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10 dark:to-black/25 md:block hidden pointer-events-none" />
          </div>

          <div className="flex flex-col justify-center flex-1 min-w-0 p-6 md:p-10 space-y-6">
            <header className="space-y-1">
              <p className="text-amber-600 dark:text-amber-400 text-sm font-medium uppercase tracking-wide">
                {stage.niveau}
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {stage.title}
              </h1>
            </header>

            {stage.descriptions?.length ? (
              <div className="space-y-4 text-gray-700 dark:text-gray-200 leading-relaxed">
                {stage.descriptions.map((d) => (
                  <p key={d.id}>{d.texte}</p>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Prêt à commencer ce parcours ? Cliquez sur le bouton ci-dessous
                pour accéder à la première section.
              </p>
            )}

            <form action={commenceGame} className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full py-8 text-lg md:text-xl font-bold uppercase tracking-wide text-white shadow-lg shadow-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl gap-2"
              >
                <Play className="h-6 w-6" />
                Commencer
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
