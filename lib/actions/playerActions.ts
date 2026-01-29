"use server";

import { prisma } from "../prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function startGameAction() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has a valid palmares
  const existingPalmares = await prisma.palmares.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!existingPalmares) {
    await prisma.palmares.create({
      data: {
        userId: user.id,
        compteurJeu: 1,
        stageLength: 1,
        score: 0,
        jeuNiveauValide: null,
        jeuValide: false,
      },
    });
  }

  redirect("/fr/joueur/emboard");
}
