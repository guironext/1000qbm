"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getJeuData } from '@/lib/actions/getJeuData';
import { handleNextGame } from '@/lib/actions/palmaresActions';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

interface Section {
  id: string;
  title: string;
  image: string;
  niveau: string;
}

interface Jeu {
  id: string;
  niveau: string;
  image?: string;
  statusJeu: string;
}

interface Question {
  id: string;
  intitule: string;
  orderNum: number;
  reponses: Reponse[];
}

interface Reponse {
  id: string;
  intitule: string;
  isCorrect: boolean;
}

interface JeuPageData {
  section: Section;
  jeu: Jeu;
  questions: Question[];
}

const JeuPage = () => {
  const params = useParams();
  const jeuId = params.id as string;
  const router = useRouter();
  const { user } = useUser();
  
  const [data, setData] = useState<JeuPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const loadJeuData = useCallback(async () => {
    try {
      const result = await getJeuData(jeuId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading jeu data');
    } finally {
      setLoading(false);
    }
  }, [jeuId]);

  useEffect(() => {
    if (jeuId) {
      loadJeuData();
    }
  }, [jeuId, loadJeuData]);

  // Auto-advance to next question after answer
  useEffect(() => {
    if (isAnswered && data && currentQuestionIndex < data.questions.length - 1) {
      const timer = setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswerId(null);
        setIsAnswered(false);
      }, 2000); // 2 second delay to show feedback

      return () => clearTimeout(timer);
    }
  }, [isAnswered, currentQuestionIndex, data]);

  // Open dialog when game is finished
  useEffect(() => {
    const isGameFinished = data && currentQuestionIndex >= data.questions.length - 1 && isAnswered;
    if (isGameFinished) {
      setShowDialog(true);
    }
  }, [isAnswered, currentQuestionIndex, data]);

  const handleAnswerSelect = (answerId: string) => {
    if (isAnswered) return;
    
    setSelectedAnswerId(answerId);
    setIsAnswered(true);
    
    if (!data) return;
    
    const currentQuestion = data.questions[currentQuestionIndex];
    const selectedAnswer = currentQuestion.reponses.find(r => r.id === answerId);
    
    if (selectedAnswer?.isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleDialogClose = () => {

       // If not victorious, restart the game
       setShowDialog(false);
       setCurrentQuestionIndex(0);
       setScore(0);
       setSelectedAnswerId(null);
       setIsAnswered(false);

  };

  const handleNextGameClick = async () => {
    if (!user?.id) return;

    try {
      await handleNextGame(user.id, score);
      setScore(0);
      setShowDialog(false);
      router.push('/fr/joueur/board');
    } catch (error) {
      console.error('Error handling next game:', error);
    }
  };

  const currentQuestion = data?.questions[currentQuestionIndex];
  const isGameFinished = data && currentQuestionIndex >= data.questions.length - 1 && isAnswered;
  const scorePercentage = data ? (score / data.questions.length) * 100 : 0;
  const isVictorious = scorePercentage >= 80;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement du jeu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Erreur: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Div - Image */}
          <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
            <Image
              src={data.section.image}
              alt={data.section.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Right Div - All Other Data */}
          <div className="space-y-6 bg-white rounded-lg shadow-lg p-6">
            {/* Section Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {data.section.title}
              </h1>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">
                Niveau: {data.jeu.niveau}
              </h2>
            </div>

            {/* Jeu Display */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Jeu</h2>
                <div className="text-lg font-semibold text-blue-600">
                  Score: {score} / {data.questions.length}
                </div>
              </div>
              
              {/* Questions Display */}
              {currentQuestion && (
                <div className="mt-6 space-y-6">
                  <div className="mb-4">
                    <p className="text-sm font-bold mb-2 text-orange-600 bg-orange-100 rounded-lg p-2">
                      Question {currentQuestionIndex + 1} sur {data.questions.length}
                    </p>
                    <h3 className="text-xl font-semibold mb-4">
                      {currentQuestion.intitule}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {currentQuestion.reponses.map((reponse) => {
                      const isSelected = selectedAnswerId === reponse.id;
                      const isCorrect = reponse.isCorrect;
                      const showResult = isAnswered;
                      
                      let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
                      
                      if (showResult) {
                        if (isCorrect) {
                          buttonClass += "bg-green-100 border-green-500 text-green-800";
                        } else if (isSelected && !isCorrect) {
                          buttonClass += "bg-red-100 border-red-500 text-red-800";
                        } else {
                          buttonClass += "bg-gray-50 border-gray-300 text-gray-600";
                        }
                      } else {
                        buttonClass += isSelected
                          ? "bg-blue-100 border-blue-500 text-blue-800"
                          : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50";
                      }
                      
                      return (
                        <button
                          key={reponse.id}
                          onClick={() => handleAnswerSelect(reponse.id)}
                          disabled={isAnswered}
                          className={buttonClass}
                        >
                          {reponse.intitule}
                          {showResult && isCorrect && (
                            <span className="ml-2 text-green-600 font-bold">✓</span>
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <span className="ml-2 text-red-600 font-bold">✗</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

   
      {/* Game Finished Dialog */}
      {showDialog && isGameFinished && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp">
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-6 py-8 md:px-10 md:py-12">
              <div className="text-center space-y-6">
                {!isVictorious &&
                  <>
                    {/* Defeat Header */}
                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                        Score Final
                      </h2>
                      <div className="flex justify-center mb-6">
                        <div className="relative w-48 h-48 md:w-56 md:h-56">
                          <Image
                            src="/defeat.gif"
                            alt="Defeat"
                            fill
                            className="object-contain rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-red-200">
                      <div className="space-y-2">
                        <p className="text-2xl md:text-3xl font-bold text-gray-800">
                          Score: <span className="text-red-600">{score}</span> / {data.questions.length}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-3 max-w-xs">
                            <div
                              className="bg-gradient-to-r from-red-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${scorePercentage}%` }}
                            />
                          </div>
                          <span className="text-xl font-semibold text-red-600 min-w-[60px]">
                            {scorePercentage.toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-lg text-gray-600 font-medium">
                          de réussite
                        </p>
                      </div>
                    </div>

                    {/* Bible Verse Section */}
                     <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 md:p-8 mb-6 border-2 border-blue-200 shadow-inner">
                      <div className="space-y-4">
                        <div className="flex items-center justify-center mb-2">
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                        </div>
                        <blockquote className="text-lg md:text-xl text-gray-800 italic leading-relaxed font-medium">
                          &ldquo;Fortifiez-vous et ayez du courage… car l&apos;Éternel, ton Dieu, marche lui-même avec toi; il ne te délaissera point.&rdquo;
                        </blockquote>
                        <p className="text-base md:text-lg text-blue-700 font-semibold mt-4">
                          — Deutéronome 31:6
                        </p>  
                      </div>
                    </div>

                  </>
                }

                {isVictorious &&
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
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                      <div className="space-y-2">
                        <p className="text-2xl md:text-3xl font-bold text-gray-800">
                          Score: <span className="text-green-600">{score}</span> / {data.questions.length}
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
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 md:p-8 mb-6 border-2 border-blue-200 shadow-inner">
                      <div className="space-y-4">
                        <div className="flex items-center justify-center mb-2">
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                        </div>
                        <blockquote className="text-lg md:text-xl text-gray-800 italic leading-relaxed font-medium">
                          &ldquo;Mais grâce soit rendue à Dieu, qui nous donne la victoire par notre Seigneur Jésus-Christ.&rdquo;
                        </blockquote>
                        <p className="text-base md:text-lg text-blue-700 font-semibold mt-4">
                          — 1 Corinthiens 15:57
                        </p>
                      </div>
                    </div>
                  </>

                }

              </div>
            </div>

            {/* Fixed Button Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 md:px-10 md:py-6">
              {!isVictorious 
              && 
              <Button
                onClick={handleDialogClose}
                className="w-full py-4 px-6 rounded-xl font-bold text-lg md:text-xl text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 "
              >
                 💪 Courage! Reprends Suivant 
              </Button> 
              }
              
              {isVictorious &&
               <Button
                 onClick={handleNextGameClick}
                 className="w-full py-4 px-6 rounded-xl font-bold text-lg md:text-xl text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
               >
                  🎉 Félicitations !!! Jeu Suivant
               </Button>
               }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JeuPage;

