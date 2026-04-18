"use client";

import QuestionFlow, { type VictoryPayload } from "@/components/game/QuestionFlow";
import { completeNosStagesSection } from "@/lib/actions/nosStagesActions";
import type { SectionAnswerPayload } from "@/lib/actions/boardActions";

type QuestionVM = {
  id: string;
  intitule: string;
  reponses: { id: string; intitule: string; isCorrect: boolean }[];
};

export default function NosStagesSectionPlayClient({
  stageId,
  sectionId,
  jeuTitle,
  niveau,
  questions,
}: {
  stageId: string;
  sectionId: string;
  jeuTitle?: string;
  niveau?: string;
  questions: QuestionVM[];
}) {
  async function onVictorySubmit(payload: VictoryPayload) {
    const answers: SectionAnswerPayload[] = payload.answers;
    const res = await completeNosStagesSection(stageId, sectionId, answers);
    if (res?.ok === false) {
      window.alert(res.message);
      return false;
    }
  }

  return (
    <QuestionFlow
      questions={questions}
      jeuTitle={jeuTitle}
      niveau={niveau}
      onVictorySubmit={onVictorySubmit}
      victoryButtonLabel="Prochain Jeu"
    />
  );
}
