"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';

interface Stage {
  id: string;
  niveau: string;
  image: string;
  descriptions: string;
  stageNumOrder: number;
}

const BoardPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          // Get all stages
          const stagesResponse = await fetch('/api/stages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getAll' })
          });
          const stages = await stagesResponse.json();

          // Check if user has palmares
          const palmaresResponse = await fetch('/api/palmares', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getCurrent', userId: user?.id })
          });
          const palmares = await palmaresResponse.json();

          if (!palmares) {
            // No palmares - get first stage
            const firstStage = stages.find((s: Stage) => s.stageNumOrder === 1);
            setCurrentStage(firstStage);
          } else {
            // Has palmares - get current stage
            const currentStage = stages.find((s: Stage) => s.stageNumOrder === palmares.stageNumOrder);
            setCurrentStage(currentStage);
          }
        } catch (error) {
          console.error('Error initializing board:', error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [user]);

  const handleStartStage = async () => {
    if (!user || !currentStage) return;

    try {
      // Check if user has palmares
      const palmaresResponse = await fetch('/api/palmares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getCurrent', userId: user.id })
      });
      const existingPalmares = await palmaresResponse.json();

      if (!existingPalmares) {
        // Get first section of first stage
        const sectionResponse = await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'getByStageAndOrder', 
            stageId: currentStage.id,
            numOrder: 1 
          })
        });
        const section = await sectionResponse.json();

        // Create first palmares
        await fetch('/api/palmares', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createNew',
            userId: user.id,
            stageLength: 1,
            stageNumOrder: 1,
            stageNiveau: currentStage.niveau,
            sectionNumOrder: 1,
            sectionNiveau: section.niveau,
            niveauJeu: section.jeux[0]?.niveau || '',
            langue: user.langue || 'FR',
            numOrder: 1,
            score: 0,
            stageId: currentStage.id,
            sectionId: section.id
          })
        });

        // Navigate to first jeu
        router.push(`/fr/joueur/jeu/${section.jeux[0]?.id}`);
      } else {
        // Get current section and navigate to jeu
        const sectionResponse = await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'getByStageAndOrder', 
            stageId: currentStage.id,
            numOrder: existingPalmares.sectionNumOrder 
          })
        });
        const section = await sectionResponse.json();
        
        if (section?.jeux?.[0]) {
          router.push(`/fr/joueur/jeu/${section.jeux[0].id}`);
        }
      }
    } catch (error) {
      console.error('Error starting stage:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-lg sm:text-xl">Chargement...</div>
      </div>
    );
  }

  if (!currentStage) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-lg sm:text-xl">Aucun stage disponible</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Stage Image */}
          <div className="relative w-full h-64 sm:h-80 lg:h-96">
            <Image
              src={currentStage.image}
              alt={`Stage ${currentStage.niveau}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Stage Content */}
          <div className="p-6 lg:p-8">
            <div className="text-center space-y-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                Stage {currentStage.niveau}
              </h1>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
                  {currentStage.descriptions}
                </p>
              </div>

              <button
                onClick={handleStartStage}
                className="w-full max-w-md py-4 px-8 rounded-xl font-bold text-xl text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                🚀 Commençons
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardPage;