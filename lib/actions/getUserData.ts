"use server";

import { prisma } from "../prisma";
import { auth } from "@clerk/nextjs/server";

export async function getUserData() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        palmares: {
          include: {
            jeu: {
              include: {
                stage: true,
                section: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function getCurrentGameProgress() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const currentPalmares = await prisma.palmares.findFirst({
      where: {
        userId: (await prisma.user.findUnique({ where: { clerkId: userId } }))?.id,
        isFinished: false
      },
      include: {
        jeu: {
          include: {
            stage: true,
            section: true,
            questions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return currentPalmares;
  } catch (error) {
    console.error("Error fetching current game progress:", error);
    return null;
  }
}