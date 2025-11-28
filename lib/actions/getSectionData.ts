"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getSectionData() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { 
      boardIndex: true,
      palmares: true
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if Palmares is empty
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

    if (!jeu || !jeu.section) {
      return null;
    }

    // Update jeu status to CURRENT
    await prisma.jeu.update({
      where: { id: jeu.id },
      data: { statusJeu: 'CURRENT' }
    });

    return {
      id: jeu.id,
      image: jeu.section.image,
      title: jeu.section.title,
      niveau: jeu.section.niveau
    };
  } else {
    const jeu = await prisma.jeu.findFirst({
      where: {
        statusJeu: 'CURRENT'
      },
      include: {
        section: true
      }
    });

    if (!jeu || !jeu.section) {
      return null;
    }

    return {
      id: jeu.id,
      image: jeu.section.image,
      title: jeu.section.title,
      niveau: jeu.section.niveau
    };
  }
}
