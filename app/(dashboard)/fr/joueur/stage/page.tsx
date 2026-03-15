import { getStagePageData } from "@/lib/actions/boardActions";
import { Badge } from "@/components/ui/badge";
import { CommenconsButton } from "./CommenconsButton";

function getImageUrl(path: string | null | undefined) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `/uploads/${path}`;
}

export default async function StagePage() {
  const { stage } = await getStagePageData();

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch">
        {/* Left Column: Stage Image */}
        <div className="lg:col-span-5 w-full flex flex-col">
          <div className="relative aspect-video lg:aspect-auto lg:h-full w-full max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 min-h-[300px]">
            {stage?.image && getImageUrl(stage.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getImageUrl(stage.image)}
                alt={stage.title || "Stage Image"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Niveau, Title, Descriptions */}
        <div className="lg:col-span-7 w-full flex flex-col">
          <div className="space-y-4 mb-6">
            {stage?.niveau && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none px-3 py-1 text-xl shadow-lg">
                {stage.niveau}
              </Badge>
            )}
            {stage?.title && (
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {stage.title}
              </h1>
            )}
          </div>

          <div className="space-y-4">
            {stage?.descriptions?.map((p) => (
              <p
                key={p.id}
                className="text-black dark:text-gray-300 leading-relaxed text-xl"
              >
                {p.texte}
              </p>
            ))}
          </div>
          <CommenconsButton />
        </div>
      </div>
    </div>
  );
}
