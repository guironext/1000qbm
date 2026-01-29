import {
  getBoardPageData,
  handleCommenconsClick,
} from "@/lib/actions/boardActions";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function TransitStagePage() {
  const data = await getBoardPageData();
  const { currentStage } = data;

  if (!currentStage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-xl text-red-600 font-semibold mb-2">
            Étape introuvable
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Impossible de charger les informations de l&apos;étape.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 flex flex-col justify-center">
      <div className="flex flex-col md:flex-row items-stretch gap-8 w-full max-w-6xl mx-auto">
        {/* Left/Top Column: Image Display */}
        {currentStage.image && (
          <div className="w-full md:w-1/2 relative group">
            <div className="relative h-64 md:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <Image
                src={
                  currentStage.image.startsWith("http")
                    ? currentStage.image
                    : `/uploads/${currentStage.image}`
                }
                alt={currentStage.title || "Stage image"}
                fill
                className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        )}

        {/* Right/Bottom Column: Content & Action */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-8">
          <div className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 p-8 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
            {/* Header */}
            <div className="mb-6 relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-bold rounded-full uppercase tracking-wider">
                  Nouvelle Étape
                </span>
                {currentStage.niveau && (
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-full">
                    Niveau {currentStage.niveau}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {currentStage.title}
              </h1>
            </div>

            {/* Descriptions */}
            <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {currentStage.descriptions?.map(
                (desc: { id: string; texte: string }, index: number) => (
                  <div key={desc.id || index} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
                      {desc.texte}
                    </p>
                  </div>
                ),
              )}
              {(!currentStage.descriptions ||
                currentStage.descriptions.length === 0) && (
                <p className="text-center text-gray-500 italic">
                  Prêt pour le défi ?
                </p>
              )}
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
          </div>

          <form action={handleCommenconsClick} className="w-full">
            <Button
              type="submit"
              size="lg"
              className="w-full py-8 text-xl font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl rounded-xl flex items-center justify-center gap-2 group"
            >
              Commençons
              <svg
                className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
