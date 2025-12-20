"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Langue } from "@/lib/generated/prisma/index.js";

export async function getGameSection() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { 
        boardIndex: true,
        palmares: {
          where: { statusJeu: 'CURRENT' },
          include: {
            section: true,
            jeu: true
          }
        }
      }
    });

    if (!user) return null;

    // If Palmares is empty
    if (user.palmares.length === 0) {
      const boardIndexValue = user.boardIndex?.play1 || 1;
      
      const jeu = await prisma.jeu.findFirst({
        where: {
          numOrder: boardIndexValue,
        },
        include: {
          section: true
        }
      });

      if (!jeu || !jeu.section) return null;

      // Create Palmares with statusJeu === CURRENT
      await prisma.palmares.create({
        data: {
          userId: user.id,
          jeuId: jeu.id,
          sectionId: jeu.sectionId,
          stageId: jeu.stageId,
          statusJeu: 'CURRENT',
          niveauJeu: jeu.niveau,
          langue: (user.langue as Langue) || Langue.FR,
          numOrder: jeu.numOrder,
          score: 0,
          isFinished: false
        }
      });

      // Fetch jeu with questions
      const jeuWithQuestions = await prisma.jeu.findUnique({
        where: { id: jeu.id },
        include: {
          questions: {
            include: {
              reponses: true
            }
          },
          section: true,
          stage: true
        }
      });

      if (!jeuWithQuestions) return null;

      return {
        jeu: jeuWithQuestions,
        section: jeuWithQuestions.section!
      };
    } 
    
    // If Palmares exists with CURRENT status
    const currentPalmares = user.palmares[0];
    if (currentPalmares?.jeu) {
      const jeuWithQuestions = await prisma.jeu.findUnique({
        where: { id: currentPalmares.jeuId! },
        include: {
          questions: {
            include: {
              reponses: true
            }
          },
          section: true,
          stage: true
        }
      });

      if (!jeuWithQuestions?.section) return null;

      return {
        jeu: jeuWithQuestions,
        section: jeuWithQuestions.section
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching game section:", error);
    return null;
  }
}

