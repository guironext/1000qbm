import React from "react";
import { getNosStagesSectionsListData } from "@/lib/actions/nosStagesActions";
import NosStagesSectionsViewClient from "@/components/joueur/NosStagesSectionsViewClient";

export default async function NosStagesSectionsPage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;
  const { stage, sections } = await getNosStagesSectionsListData(stageId);

  return (
    <NosStagesSectionsViewClient
      stageId={stageId}
      stageTitle={stage.title}
      sections={sections}
    />
  );
}
