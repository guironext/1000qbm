"use server";

import { prisma } from "../prisma";
import { Langue } from "@/lib/generated/prisma/index.js";

export type JeuInput = {
  langue: Langue;
  image?: string;
  niveau: string;
  numOrder: number | string;
  stageId: string;
  sectionId?: string;
};

export async function createJeu(data: JeuInput) {
  const { langue, image, niveau, numOrder, stageId, sectionId } = data;

  const jeu = await prisma.jeu.create({
    data: {
      langue,
      image: image || null,
      niveau,
      numOrder: Number(numOrder),
      stageId,
      sectionId: sectionId || null,
    },
  });

  return jeu;
}

export async function deleteJeu(id: string) {
  try {
    await prisma.jeu.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting jeu:", error);
    return { success: false };
  }
}

export type UpdateJeuInput = {
  id: string;
  langue?: Langue;
  image?: string;
  niveau?: string;
  numOrder?: number | string;
  stageId?: string;
  sectionId?: string;
};

export async function updateJeu(input: UpdateJeuInput) {
  const { id, langue, image, niveau, numOrder, stageId, sectionId } = input;

  const data: Partial<{
    langue: Langue;
    image: string | null;
    niveau: string;
    numOrder: number;
    stageId: string;
    sectionId: string | null;
  }> = {};
  
  if (langue !== undefined) data.langue = langue;
  if (image !== undefined) data.image = image || null;
  if (niveau !== undefined) data.niveau = niveau;
  if (numOrder !== undefined) data.numOrder = Number(numOrder);
  if (stageId !== undefined) data.stageId = stageId;
  if (sectionId !== undefined) data.sectionId = sectionId || null;

  const jeu = await prisma.jeu.update({
    where: { id },
    data,
  });

  return jeu;
}

export async function getAllJeux() {
  try {
    const jeux = await prisma.jeu.findMany({
      orderBy: { numOrder: "asc" },
      include: {
        stage: true,
        section: true,
        questions: {
          include: {
            reponses: true
          }
        }
      },
    });
    return jeux;
  } catch (error) {
    console.error("Error fetching jeux:", error);
    return [];
  }
}

export async function getCurrentStageJeux() {
  try {
    // First, find the current stage
    const currentStage = await prisma.stage.findFirst({
      where: { statusStage: "CURRENT" },
      select: { id: true }
    });

    if (!currentStage) {
      return [];
    }

    // Get all jeux for the current stage with status CURRENT
    const jeux = await prisma.jeu.findMany({
      where: { 
        stageId: currentStage.id,
        statusJeu: "CURRENT"
      },
      orderBy: { numOrder: "asc" },
      include: {
        stage: true,
        section: true,
        questions: {
          include: {
            reponses: true
          }
        }
      }
    });

    return jeux;
  } catch (error) {
    console.error("Error fetching current stage jeux:", error);
    return [];
  }
}