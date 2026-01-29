import {
  getBoardPageData,
  handleCommenconsClick,
} from "@/lib/actions/boardActions";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function EmboardPage() {
  const data = await getBoardPageData();
  const { currentStage } = data;

  if (!currentStage) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl text-red-600 font-semibold mb-2">
          Erreur ou Fin du Jeu
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Impossible de trouver l'étape actuelle. Veuillez contacter le support
          si le problème persiste.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 flex flex-col justify-center bg-transparent">
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
            {/* Detailed decorative header */}
            <div className="mb-6 relative z-10">
              <span className="inline-block px-3 py-2 bg-amber-100 text-amber-700 text-xl font-semibold rounded-full mb-3">
                Niveau {currentStage.niveau}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                {currentStage.title}
              </h1>
            </div>

            {/* Descriptions */}
            <div className="space-y-4 relative z-10">
              {currentStage.descriptions?.map((desc, index) => (
                <div key={desc.id || index}>
                  <p className="text-gray-700 dark:text-gray-200 text-lg leading-loose font-light">
                    {desc.texte}
                  </p>
                </div>
              ))}
              {(!currentStage.descriptions ||
                currentStage.descriptions.length === 0) && (
                <p className="text-center text-gray-500 italic">
                  Aucune description disponible.
                </p>
              )}
            </div>

            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
          </div>

          <form action={handleCommenconsClick} className="w-full">
            <Button
              type="submit"
              size="lg"
              className="w-full py-8 text-xl font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl rounded-xl"
            >
              Commençons l'aventure
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
