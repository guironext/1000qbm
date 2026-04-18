"use client";

import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  ListOrdered,
} from "lucide-react";
import Image from "next/image";

// Define simplified types for props to avoid heavy Prisma type dependencies client-side
interface Reponse {
  id: string;
  intitule: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  intitule: string;
  reponses: Reponse[];
}

export type VictoryPayload = {
  score: number;
  answers: { questionId: string; reponseId: string }[];
};

interface QuestionFlowProps {
  questions: Question[];
  jeuTitle?: string;
  niveau?: string;
  /** Called after ≥80% success; server should verify answers. Return false to stop loading state. */
  onVictorySubmit?: (
    payload: VictoryPayload,
  ) => Promise<boolean | void | undefined>;
  victoryButtonLabel?: string;
}

export default function QuestionFlow({
  questions,
  jeuTitle,
  niveau,
  onVictorySubmit,
  victoryButtonLabel = "Prochain Jeu",
}: QuestionFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReponseId, setSelectedReponseId] = useState<string | null>(
    null,
  );
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; reponseId: string }[]
  >([]);

  const currentQuestion = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;

  const handleReponseClick = (reponse: Reponse) => {
    if (isAnswered) return;

    const questionId = currentQuestion.id;
    setSelectedReponseId(reponse.id);
    setIsAnswered(true);
    setAnswers((prev) => [...prev, { questionId, reponseId: reponse.id }]);

    if (reponse.isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    setSelectedReponseId(null);
    setIsAnswered(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        Aucune question trouvée pour ce jeu.
      </div>
    );
  }

  if (isFinished) {
    const scorePercentage = (score / questions.length) * 100;
    const isDefeat = scorePercentage < 80;    

    return (
      <Card className="overflow-hidden border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transform transition-all duration-500 animate-in fade-in zoom-in-95">
        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center space-y-6">
          {isDefeat ? (
            <>
              {/* Defeat Header */}
              <div className="space-y-4 w-full">
                <h2 className="text-4xl md:text-5xl font-bold text-red-600 mb-2 drop-shadow-sm">
                  Score Final
                </h2>
                <div className="flex justify-center mb-6">
                  <div className="relative w-48 h-48 md:w-56 md:h-56 ring-4 ring-red-100 rounded-full shadow-lg overflow-hidden">
                    <Image
                      src="/defeat.gif"
                      alt="Defeat"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Score Display */}
              <div className="w-full bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-red-200 shadow-sm">
                <div className="space-y-3">
                  <p className="text-2xl md:text-3xl font-bold text-gray-800">
                    Score: <span className="text-red-600">{score}</span> /{" "}
                    {questions.length}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-4 max-w-xs overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${scorePercentage}%` }}
                      />
                    </div>
                    <span className="text-xl font-bold text-red-600 min-w-[60px]">
                      {scorePercentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    de réussite
                  </p>
                </div>
              </div>

              {/* Bible Verse Section */}
              <div className="w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 md:p-8 mb-6 border-2 border-blue-200 shadow-inner">
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-8 h-8 text-blue-600 opacity-80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  <blockquote className="text-lg md:text-xl text-gray-800 italic leading-relaxed font-serif font-medium relative z-10 px-4">
                    &ldquo;Désolé ! <br />
                  10 Si tu te laisses abattre au jour de l&apos;adversité, <br />
                  ta force est bien peu de chose. <br />
                  (Proverbe 24 : 10) ; donc persévère…. <br />
&rdquo;
                  </blockquote>
                  <p className="md:text-lg text-blue-700 font-bold tracking-wide mt-4 uppercase text-sm">
                    — Proverbe 24 : 10
                  </p>
                </div>
              </div>

              <Button
                className="w-full max-w-sm bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-6 px-8 rounded-xl shadow-lg transform transition-transform hover:scale-[1.02]"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Réessayer
              </Button>
            </>
          ) : (
            <>
              {/* Show reading.gif while submitting */}
              {isSubmitting ? (
                <div className="flex flex-col items-center justify-center py-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/reading.gif"
                    alt="Chargement..."
                    className="w-32 h-32 md:w-40 md:h-40 object-contain"
                  />
                  <p className="mt-4 text-lg text-gray-600 font-medium">
                    Chargement…
                  </p>
                </div>
              ) : (
                <>
              {/* Victory Header */}
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-2 animate-bounce">
                  Victorieux! 🎉
                </h2>
                <div className="flex justify-center mb-6">
                  <div className="relative w-48 h-48 md:w-56 md:h-56">
                    <Image
                      src="/happy.gif"
                      alt="Victory"
                      fill
                      className="object-contain rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Score Display */}
              <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <div className="space-y-2">
                  <p className="text-2xl md:text-3xl font-bold text-gray-800">
                    Score: <span className="text-green-600">{score}</span> /{" "}
                    {questions.length}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-3 max-w-xs">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${scorePercentage}%` }}
                      />
                    </div>
                    <span className="text-xl font-semibold text-green-600 min-w-[60px]">
                      {scorePercentage.toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    de réussite
                  </p>
                </div>
              </div>

              {/* Bible Verse Section */}
             

              <Button
                className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-12 rounded-full shadow-xl transform transition-transform hover:scale-105"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const ok = await onVictorySubmit?.({ score, answers });
                    if (ok !== false) {
                      setIsSubmitting(false);
                    }
                  } catch (e) {
                    if (isRedirectError(e)) {
                      setIsSubmitting(false);
                      throw e;
                    }
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? "Chargement…" : victoryButtonLabel}{" "}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const progressPct =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "rounded-2xl border border-amber-200/70 dark:border-amber-800/45",
          "bg-gradient-to-br from-amber-50/90 via-white to-orange-50/50",
          "dark:from-gray-900/80 dark:via-gray-900/70 dark:to-amber-950/25",
          "shadow-sm ring-1 ring-amber-100/60 dark:ring-gray-700/80",
          "backdrop-blur-sm overflow-hidden",
        )}
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 hidden h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 sm:block"
                aria-hidden
              />
              <div className="min-w-0">
                <h2 className="text-base font-bold leading-tight text-gray-900 dark:text-gray-50 sm:text-xl md:text-2xl">
                  {jeuTitle?.trim() ? jeuTitle : "Questions"}
                </h2>
                {niveau ? (
                  <p className="mt-1.5 inline-flex items-center rounded-full border border-amber-200/80 bg-amber-100/60 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-900/90 dark:border-amber-700/50 dark:bg-amber-950/50 dark:text-amber-200">
                    {niveau}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <div
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl px-3",
                "border border-amber-200/90 bg-white/80 dark:border-amber-700/40 dark:bg-amber-950/40",
                "shadow-sm",
              )}
            >
              <Trophy
                className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/80 dark:text-amber-300/90">
                  Score
                </span>
                <span className="text-sm font-bold tabular-nums text-amber-950 dark:text-amber-50 md:text-base">
                  {score}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl px-3",
                "border border-gray-200/90 bg-gray-50/90 dark:border-gray-600/60 dark:bg-gray-800/80",
                "shadow-sm",
              )}
            >
              <ListOrdered
                className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400"
                aria-hidden
              />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Question
                </span>
                <span className="text-sm font-bold tabular-nums text-gray-800 dark:text-gray-100 md:text-base">
                  {currentIndex + 1}
                  <span className="font-semibold text-gray-400 dark:text-gray-500">
                    {" "}
                    / {questions.length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="h-1.5 bg-gray-200/90 dark:bg-gray-800"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression dans le questionnaire"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div
        key={currentQuestion.id}
        className="animate-in fade-in slide-in-from-right-4 duration-500"
      >
        <Card className="overflow-hidden border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ring-1 ring-gray-200 dark:ring-gray-700">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-md text-lg">
                {currentIndex + 1}
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">
                {currentQuestion.intitule}
              </h3>
            </div>

            <div className="grid gap-4">
              {currentQuestion.reponses.map((reponse) => {
                const isSelected = selectedReponseId === reponse.id;
                const showCorrect = isAnswered && reponse.isCorrect;
                const showIncorrect =
                  isAnswered && isSelected && !reponse.isCorrect;

                return (
                  <div
                    key={reponse.id}
                    onClick={() => handleReponseClick(reponse)}
                    className={cn(
                      "group relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between shadow-md shadow-amber-500/20",
                      !isAnswered &&
                        "border-gray-100 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-700/50 hover:shadow-md",
                      isSelected &&
                        !isAnswered &&
                        "border-amber-500 ring-1 ring-amber-500",
                      showCorrect &&
                        "border-green-500 bg-green-50 dark:bg-green-900/20",
                      showIncorrect &&
                        "border-red-500 bg-red-50 dark:bg-red-900/20",
                      !isSelected &&
                        isAnswered &&
                        !showCorrect &&
                        "opacity-50 grayscale",
                    )}
                  >
                    <p
                      className={cn(
                        "text-lg font-medium",
                        showCorrect
                          ? "text-green-700 dark:text-green-400"
                          : showIncorrect
                            ? "text-red-700 dark:text-red-400"
                            : "text-gray-700 dark:text-gray-200",
                      )}
                    >
                      {reponse.intitule}
                    </p>

                    {/* Icons */}
                    {showCorrect && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                    {showIncorrect && (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}