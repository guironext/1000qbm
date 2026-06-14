import React from "react";
import { getParcoursPageData } from "@/lib/actions/parcoursActions";
import { ParcoursView } from "@/components/game/ParcoursView";

export default async function ParcoursPage() {
  const { stages, activeStageId, activeStageNiveau } =
    await getParcoursPageData();

  return (
    <ParcoursView
      stages={stages}
      activeStageId={activeStageId}
      activeStageNiveau={activeStageNiveau}
    />
  );
}
