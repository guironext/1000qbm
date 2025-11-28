"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getBoardPageData, createInitialPalmares, updatePalmaresSection } from '@/lib/actions/getBoardPageData';
import Image from 'next/image';

interface Paragraphe {
  id: string;
  texte: string;
}

interface Stage {
  id: string;
  title: string;
  image: string;
  niveau: string;
  numOrder: number;
  descriptions: Paragraphe[];
}

interface User {
  id: string;
  langue?: string;
}

interface Palmares {
  id: string;
  numOrder: number;
  jeuId?: string | null;
}

interface Section {
  id: string;
  title: string;
}

interface BoardData {
  hasNoPalmares: boolean;
  stage: Stage;
  user: User;
  currentPalmares: Palmares | null;
  isSpecialStage?: boolean;
  sections?: Section[];
}

const BoardPage = () => {
  const router = useRouter();
  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const result = await getBoardPageData();
      setData(result as BoardData);
    } catch (err) {
      const error = err as Error;
      if (error.message === 'ONBOARDING_REQUIRED') {
        router.push('/onboarding');
        return;
      }
      setError(error.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCommencer = async () => {
    if (!data) return;
    
    try {
      setLoading(true);

      if (data.hasNoPalmares) {
        // Create initial palmares
        const result = await createInitialPalmares(
          data.user.id,
          data.stage.id,
          data.user.langue || 'FR'
        );
        
        if (result.success && result.jeuId) {
          router.push(`/fr/joueur/jeu/${result.jeuId}`);
        }
      } else if (data.currentPalmares) {
        // Update palmares section for special stage
        const result = await updatePalmaresSection(data.currentPalmares.id);
        
        if (result.success && result.jeuId) {
          router.push(`/fr/joueur/jeu/${result.jeuId}`);
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error starting game');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Chargement...</div>
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

  if (!data || !data.stage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left Div - Stage Image */}
          <div className="w-full md:w-1/2">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={data.stage.image}
                alt={data.stage.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Right Div - Content */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Stage Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center md:text-left">
              {data.stage.title}
            </h1>

            {/* Stage Descriptions */}
            {data.stage.descriptions && data.stage.descriptions.length > 0 && (
              <div className="mb-8 space-y-4">
                {data.stage.descriptions.map((desc) => (
                  <p key={desc.id} className="text-lg text-gray-900 leading-relaxed">
                    {desc.texte}
                  </p>
                ))}
              </div>
            )}

            {/* Commençons Button */}
            <div className="flex justify-center md:justify-start mt-auto">
              <button
                onClick={handleCommencer}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Chargement...' : 'Commençons'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardPage;