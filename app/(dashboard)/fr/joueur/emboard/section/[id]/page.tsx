import {
  getSectionPageData,
  handleNiveauSuivant,
} from "@/lib/actions/boardActions";
import { Badge } from "@/components/ui/badge";
import QuestionFlow from "@/components/game/QuestionFlow";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { section, jeu } = await getSectionPageData(id);

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/uploads/${path}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch">
        {/* Left Column: Section Image */}
        <div className="lg:col-span-5 w-full flex flex-col">
          <div className="relative aspect-video lg:aspect-auto lg:h-full w-full max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 min-h-[300px]">
            {section?.image && getImageUrl(section.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImageUrl(section.image)}
                alt={section.title || "Section Image"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}

            {(section?.title || section?.niveau) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6 md:p-8">
                <div className="text-white space-y-3 w-full">
                  {section.niveau && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none px-3 py-1 text-sm shadow-lg">
                      Niveau {section.niveau}
                    </Badge>
                  )}
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                    {section.title}
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Jeu + Questions & Answers */}
        <div className="lg:col-span-7 w-full">
          {jeu.image && getImageUrl(jeu.image) && (
            <div className="relative w-full aspect-video max-w-sm mx-auto mb-6 rounded-xl overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(jeu.image)}
                alt={`Jeu ${jeu.niveau}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          <QuestionFlow
            questions={jeu.questions.map((q) => ({
              id: q.id,
              intitule: q.intitule,
              reponses: q.reponses.map((r) => ({
                id: r.id,
                intitule: r.intitule,
                isCorrect: r.isCorrect,
              })),
            }))}
            jeuTitle="Jeu"
            niveau={jeu.niveau}
            onNiveauSuivant={handleNiveauSuivant}
          />
        </div>
      </div>
    </div>
  );
}
