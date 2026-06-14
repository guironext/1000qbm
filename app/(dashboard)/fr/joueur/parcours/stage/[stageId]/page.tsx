import React from "react";
import { getParcoursStagePageData } from "@/lib/actions/parcoursActions";
import { ParcoursStageView } from "@/components/game/ParcoursStageView";

export const dynamic = "force-dynamic";

export default async function ParcoursStagePage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;
  const { stage, sections, playableCount } =
    await getParcoursStagePageData(stageId);

  return (
    <ParcoursStageView
      stageId={stageId}
      stageTitle={stage.title}
      stageNiveau={stage.niveau}
      stageImage={stage.image}
      sections={sections}
      playableCount={playableCount}
    />
  );
}
