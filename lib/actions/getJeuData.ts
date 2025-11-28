"use server";

import { prisma } from "@/lib/prisma";

export async function getJeuData(jeuId: string) {
  try {
    const jeu = await prisma.jeu.findUnique({
      where: { id: jeuId },
      include: {
        section: true,
        questions: {
          include: {
            reponses: true
          },
          orderBy: {
            orderNum: 'asc'
          }
        }
      }
    });

    if (!jeu) {
      throw new Error("Jeu not found");
    }

    if (!jeu.section) {
      throw new Error("Section not found for this jeu");
    }

    return {
      section: {
        id: jeu.section.id,
        title: jeu.section.title,
        image: jeu.section.image,
        niveau: jeu.section.niveau
      },
      jeu: {
        id: jeu.id,
        niveau: jeu.niveau,
        image: jeu.image || undefined,
        statusJeu: String(jeu.statusJeu)
      },
      questions: jeu.questions.map(q => ({
        id: q.id,
        intitule: q.intitule,
        orderNum: q.orderNum,
        reponses: q.reponses.map(r => ({
          id: r.id,
          intitule: r.intitule,
          isCorrect: r.isCorrect
        }))
      }))
    };
  } catch (error) {
    console.error("Error fetching jeu data:", error);
    throw error;
  }
}

