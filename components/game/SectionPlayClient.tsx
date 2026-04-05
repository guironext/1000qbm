"use client";

import QuestionFlow, { type VictoryPayload } from "@/components/game/QuestionFlow";
import { completeSectionPlay } from "@/lib/actions/boardActions";

type QuestionVM = {
  id: string;
  intitule: string;
  reponses: { id: string; intitule: string; isCorrect: boolean }[];
};

export default function SectionPlayClient({
  sectionId,
  jeuTitle,
  niveau,
  questions,
}: {
  sectionId: string;
  jeuTitle?: string;
  niveau?: string;
  questions: QuestionVM[];
}) {
  async function onVictorySubmit(payload: VictoryPayload) {
    const res = await completeSectionPlay(sectionId, payload.answers);
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
