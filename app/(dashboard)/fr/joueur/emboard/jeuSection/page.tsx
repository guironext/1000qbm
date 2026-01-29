import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import QuestionFlow from "@/components/game/QuestionFlow";
export default async function JeuSectionPage() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      palmares: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user || !user.palmares[0]) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 bg-red-50 rounded-xl">
        Erreur: Utilisateur ou Palmarès introuvable.
      </div>
    );
  }

  const latestPalmares = user.palmares[0];
  const jeuOrder = latestPalmares.compteurJeu;

  // Requirement: Select Section where numOrder === palmares.compteurSection
  // Requirement: Select Jeu where numOrder === palmares.compteurJeu
  // CONSTRAINT: palmares.compteurSection DOES NOT EXIST in schema.
  // INTERPRETATION: We will find the JEU first using compteurJeu.
  // Then we will use that Jeu's related Section.
  // This satisfies the "display related to selected jeu" and "display selected section" requirement effectively.

  const currentJeu = await prisma.jeu.findFirst({
    where: {
      numOrder: jeuOrder,
    },
    include: {
      section: true,
      questions: {
        orderBy: { orderNum: "asc" },
        include: {
          reponses: true,
        },
      },
    },
  });

  if (!currentJeu) {
    return (
      <div className="container mx-auto p-8 text-center text-amber-600 bg-amber-50 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Jeu introuvable</h2>
        <p>Impossible de trouver le jeu numéro {jeuOrder}.</p>
      </div>
    );
  }

  const currentSection = currentJeu.section;

  // Helper to resolve image URL
  const getImageUrl = (path: string | null) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `/uploads/${path}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch">
        {/* Left Column: Section Image & Details */}
        <div className="lg:col-span-5 w-full flex flex-col">
          <div className="relative aspect-video lg:aspect-auto lg:h-full w-full max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 min-h-[300px]">
            {currentSection?.image ? (
              <Image
                src={getImageUrl(currentSection.image)}
                alt={currentSection.title || "Section Image"}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}

            {(currentSection?.title || currentSection?.niveau) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6 md:p-8">
                <div className="text-white space-y-3 w-full">
                  {currentSection.niveau && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none px-3 py-1 text-sm shadow-lg">
                      Niveau {currentSection.niveau}
                    </Badge>
                  )}
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                    {currentSection.title}
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Questions using Interactive Flow */}
        <div className="lg:col-span-7 w-full">
          <QuestionFlow
            questions={currentJeu.questions}
            jeuTitle={`Jeu`}
            niveau={currentJeu.niveau}
          />
        </div>
      </div>
    </div>
  );
}
